const request = require('request');
const Orders = Model('Order/Orders');
const wallets = Model('Wallets/Wallets');
const walletHelper = Helper('wallet');
const Validator = Helper('validator');
const mailNotification = Helper('mail-notification');
const CyberSource = Helper('cyber-source');
const flexCyberSource = Helper('flex-cyber-source');
const application = Config('application');
const UserCourse = Model('Course/UserCourse');
const notificationAlert = Helper('notification-alert');
const OrderPayment = Model('OrderPayment');
const PaymentType = Model('PaymentType');
const commonFunction = Helper('common');
const OrderDetails  = Model('Order/OrderDetails');
const Setting = Model('Setting');
const AttendeeInformation = Model('AttendeeInformation');
const AttendeeDetail = Model('AttendeeDetail');
const moment = require('moment');
const CryptoJS = require("crypto-js");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const PaymentController = {

    paymentTypeCheck: async function(req,res,next){
    let formData = req.body;
    let paymentType = PaymentType.forge();
        paymentType
        .query((q)=>{
            q.whereRaw(`FIND_IN_SET( id,  "${formData.payment_type_id}" ) and is_active = 0`)
        })
        paymentType
        .fetchAll()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    orderPaymentDetails: async function(req,res,next){

        let formData        = req.body;
        let application     = Config('application');

        let vendorCommunicationRate = await Setting.where('access_key','vendor_commission').fetch();
        let resellerCommunicationRate = await Setting.where('access_key','reseller_commission').fetch();

        let validationRules = {
            order_id            :   'required|integer|inDatabase:orders,id',
            price_type          :   `required|in:${application.price_type.join(',')}`,
            payment_mode        :   `required|in:${application.payment_mode.join(',')}`,
            payment_status      :   `required|in:${application.payment_status.join(',')}`,
            amount              :   'required|decimal'
        };

        let validation = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_order_payment = {
            order_id         : formData.order_id,
            price_type       : formData.price_type,
            payment_mode     : formData.payment_mode,
            payment_status   : formData.payment_status,
            amount           : formData.amount,
            wallet_conversation_details : formData.wallet_conversation_details
        }

        OrderPayment.where({
            order_id    :formData.order_id
        }).fetch()
        .then((OrderPaymentDetails)=>{

            OrderDetails.where('order_id',formData.order_id)
            .save(
                {
                    "vendor_commission_rate":vendorCommunicationRate.get('value'),
                    "reseller_commission_rate":resellerCommunicationRate.get('value')
                },
                {patch:true}
            );
        })
        .then((communicationRateUpdate)=>{
            return new OrderPayment(save_order_payment).save();
        })
        .then((details)=>{
            if((formData.payment_mode === 'SXL' || formData.payment_mode === 'WSXL') && formData.payment_status === 'pending'){
                dd('pending');
                if(formData.payment_status === 'pending'){
                    mailNotification.sxlPaymentFailedMailToCustomer(formData.order_id)
                }
                commonFunction.deductEventTicket(formData.order_id);
            }
            return res.status(200).json(res.fnSuccess(details));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
    orderStatusUpdate: async function(req,res,next){
        let orderId = req.params.orderId;

        let orderUserDetails = await Orders.where('id',orderId).fetch({withRelated:['user','user.profile']});

        Orders.where('id',orderId)
        .save({"order_status":req.body.status,"is_delete":(req.body.status === 'failed') ? 1 : 0},{patch:true})
        .then((orderStatus)=>{
            if (req.body.status === 'complete') {

                /*****************Mail Send****************/

                mailNotification.OrderConfirmationMail(orderId);
                mailNotification.TutorOrderNotificationMail(orderId);
                mailNotification.AdminOrderConfirmationMail(orderId); /**need to recheck again */

                /*****************Welcome mail for course and event confirmation****************/

                PaymentController.courseWelcomeMail(orderId,orderUserDetails);
                PaymentController.eventConfirmationMail(orderId,orderUserDetails);

                /*****************Admin notification****************/

                notificationAlert.orderSuccessNotifyToAdmin(orderId, orderUserDetails.toJSON().user_id);

                /*****************Event ticket deduct and wallet functionality****************/

                commonFunction.deductEventTicket(orderId);
                commonFunction.generateWallet(orderId);
            }
            return res.status(200).json(res.fnSuccess(orderStatus));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },
    courseWelcomeMail: function(orderId,orderUserDetails){
        OrderDetails
        .where('order_id',orderId)
        .where('productable_type','courses')
        .fetchAll()
        .then((response)=>{
            if(!_.isEmpty(response.toJSON())){
                _.map(response.toJSON(),function(v){
                    mailNotification.CourseWelcomeMailTemplate(v.order_id,orderUserDetails.toJSON().user_id,orderUserDetails.toJSON().user.user_name);
                })
            }
        })
        .catch((err)=>{
            dd(err)
        })
    },

    eventConfirmationMail:async function(orderId,orderUserDetails){

        let ticketBookingTimeDiff = await Setting.where('access_key','ticketBookingTimeDiff').fetch();

        OrderDetails
        .where('order_id',orderId)
        .where('productable_type','products')
        .fetchAll({"withRelated":[
            "product.event",
            {
                "order.user":function(q){
                    q.select('id','user_name','phone_code','mobile_no') ;
                },"order.user.profile":function(q){
                    q.select('id','user_id','first_name','last_name','middle_name','country_id')
                },
                "payment_category":function(q){
                    q.select('title','id')
                }
            }
        ]})
        .then((response)=>{
            if(!_.isEmpty(response.toJSON())){
                _.map(response.toJSON(),function(v){

                    /******Attendee Information insert*******/

                    PaymentController.insertEventAttendee(v.product.event.id,v);
                    let TikcetEncryptData = {
                        "order_id":v.order_id,
                        "user_id":v.order.user.id,
                        "event_id":v.product.event.id,
                        "ticket_sale_close_date":moment(v.product.event.start_date).subtract(`${ticketBookingTimeDiff.get('value')}`,'days').format('YYYY-MM-DD'),
                        "ticket_quantity":v.quantity,
                        "ticket_category":v.payment_category.title
                    };

                    // /***********Encoded attendee details************/

                    let encrypted =  CryptoJS.AES.encrypt(JSON.stringify(TikcetEncryptData), process.env.ENCRYPTION_KEY);

                    let attendeeInfoEncryptStr = encodeURIComponent(encrypted.toString());

                    mailNotification.eventConfirmationMailTemplate(orderUserDetails.toJSON(),v.productable_id,v.quantity,attendeeInfoEncryptStr);
                })
            }
        })
        .catch((err)=>{
            dd(err)
        })
    },
    insertEventAttendee:async function(eventId,data){

        let ticketBookingTimeDiff = await Setting.where('access_key','ticketBookingTimeDiff').fetch();
        let getTicketUser = await AttendeeInformation
                                .where('user_id',data.order.user.id)
                                .where('event_id',eventId)
                                .where('order_id',data.order_id)
                                .count();

        if(getTicketUser == 0){
            let attendeeInformationDataArr = {
                "order_id":data.order_id,
                "event_id":eventId,
                "user_id":data.order.user.id,
                "payment_category_id":data.payment_category.id,
                "ticket_sent_date":moment(data.product.event.start_date).subtract(`${ticketBookingTimeDiff.get('value')}`,'days').format('YYYY-MM-DD'),
                "attendee":(data.quantity == 1) ? 1 : 0
            };

            new AttendeeInformation(attendeeInformationDataArr)
            .save()
            .then((attendeeInfo)=>{
                let attendeeDetailsDataArr = [];
                if(data.quantity){
                    let i;
                    for(i=1; i<=data.quantity;i++){
                        if(i == 1){
                            /*==== set default attendee details ==== */
                            attendeeDetailsDataArr.push({
                                "attendee_id":attendeeInfo.get('id'),
                                "country_id":data.order.user.profile.country_id,
                                "ticket_number":`${Config('application').event_ticket_no}-${moment(data.product.event.start_date).format('MD')}-${Math.random().toString(36).slice(8)}-${i}`,
                                "first_name":data.order.user.profile.first_name,
                                "last_name":data.order.user.profile.last_name,
                                "email":data.order.user.user_name,
                                "phone_code":data.order.user.phone_code,
                                "phone_number":data.order.user.mobile_no,
                                "bar_code":"",
                                "qr_code":"",
                                "is_default":1
                            })
                        }
                        else{
                            /*==== insert blank attendee detail ==== */
                            attendeeDetailsDataArr.push({
                                "attendee_id":attendeeInfo.get('id'),
                                "country_id":null,
                                "ticket_number":`${Config('application').event_ticket_no}-${moment(data.product.event.start_date).format('MD')}-${Math.random().toString(36).slice(8)}-${i}`,
                                "first_name":"",
                                "last_name":"",
                                "email":"",
                                "phone_code":"",
                                "phone_number":"",
                                "bar_code":"",
                                "qr_code":"",
                                "is_default":"0"
                            })
                        }
                    }
                    new AttendeeDetail().batchInsert(attendeeDetailsDataArr);
                }
            })
            .catch((err)=>{
                dd(err);
            })
        }
    },
    paymentCyberSource_new:async function (req,res,next){ 
        let paymentRes = null;
        let formData = req.body;
                
        if(application.flex_card_type.indexOf(formData.card.card_type) === -1){            
           return res.status(400).json(res.fnError('Please enter a valid cart'));
        }        
        
        flexCyberSource
        .generateKey()
        .then((keyResult)=>{
            return flexCyberSource.generateToken(keyResult,formData.card);            
        })
        .then((tokenResult)=>{
            return flexCyberSource.paymentProcess(tokenResult,formData);         
        })
        .then((paymentResponse)=>{   
            paymentRes = paymentResponse;         
            if(paymentResponse.status === 'AUTHORIZED'){
                return PaymentController.orderModifyForPayment(paymentResponse,formData, 'success');
            }
        })
        .then(function (resObj) {

            return res.status(200).json(res.fnSuccess({
                order_id: req.body.order_id,
                payment_status: 'complete',
                payment_message: 'Success',
                order_status: 'complete',
                transaction_id: paymentRes.id,
            }));
        })
        .catch((errors)=>{
            PaymentController.orderModifyForPayment(errors, formData, 'error')
                .then((r) => {                   
                    let contactUsLink = `${getConfig('application').email.url}/contact`;
                    let myOrderLink =  `${getConfig('application').email.url}/dashboard/transactions`;
                    Orders.where('id',formData.order_id).save({'order_status':'failed'},{patch:true})
                    mailNotification.orderFailedMailToCustomer(formData.order_id,errors,contactUsLink,myOrderLink);
                })
                .catch((e) => {
                    dd(e);
                });

                return res.status(400).json(res.fnError({
                    order_id: formData.order_id,
                    payment_status: 'cancel',
                    payment_message: errors || '',
                    order_status: 'complete',
                    transaction_id: ''
                }));
            
        })     
    },
    paymentCyberSource: async function (req, res, next) {
        let paymentRes = null;
        CyberSource
            // .setItems(req.body.items)
            .setGrandTotal(req.body.net_amount)
            .setCard(req.body.card)
            .setBillingAddress(req.body.billing_address, req.connection.remoteAddress)
            .requestCCPayment()
            .then(function (resObj) {
                paymentRes = resObj;
                console.log(resObj,'resObjresObjresObjresObjresObj');                
                return PaymentController.orderModifyForPayment(resObj, req.body, 'success');
            })
            .then(function (resObj) {
                return res.status(200).json(res.fnSuccess({
                    order_id: req.body.order_id,
                    payment_status: 'complete',
                    payment_message: resObj.message || '',
                    order_status: 'complete',
                    transaction_id: paymentRes.receive['soap:Envelope']['soap:Body']['c:replyMessage']['c:merchantReferenceCode']['_text'],
                }));
            })
            .catch(function (errObj) {
                PaymentController.orderModifyForPayment(errObj, req.body, 'error')
                .then((r) => {
                    dd(r);
                    let contactUsLink = `${getConfig('application').email.url}/contact`;
                    let myOrderLink =  `${getConfig('application').email.url}/dashboard/transactions`;
                    Orders.where('id',req.body.order_id).save({'order_status':'failed'},{patch:true})
                    mailNotification.orderFailedMailToCustomer(req.body.order_id,errObj.message,contactUsLink,myOrderLink);
                })
                .catch((e) => {
                    dd(e);
                });

                return res.status(400).json(res.fnError({
                    order_id: req.body.order_id,
                    payment_status: 'cancel',
                    payment_message: errObj.message || '',
                    order_status: 'complete',
                    transaction_id: (paymentRes) ? paymentRes.receive['soap:Envelope']['soap:Body']['c:replyMessage']['c:merchantReferenceCode']['_text'] : null,
                }));
            });

    },





    stripeSession: async function(req, res, next) {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: req.body.product,
                  },
                  unit_amount: 100 * parseInt(req.body.total),
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: 'http://localhost:4200/checkout?status='+req.body.type+'success',
            cancel_url: 'http://localhost:4200/order-failure',
          });
        
          res.status(200).json({ id: session.id });
    },

    paymentWallet: async function (req, res, next) {

        let validationRules = {
            order_id: 'required|integer|inDatabase:orders,id',
            amount: 'required|decimal',
            wallet_id: 'required|integer|inDatabase:wallets,id',
            user_id: 'required|integer|inDatabase:users,id',
            user_type: `required|in:${_.join(getConfig('application.payment_wallet_user_role'), ',')}`,
        };
        let validation = new Validator(req.body, validationRules);

        let matched = await validation.check();

        if (await wallets.where('id', req.body.wallet_id).where('amount', '>=', req.body.amount).count() === 0) {
            return res.status(400).json(res.fnError("You dont't have a sufficient balance in your wallet!."));
        }

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }


        let walletTransactionObj = {
            transactionable_type: 'orders',
            transactionable_id: req.body.order_id,
            description: (req.body.user_type === 'customer') ? `${getConfig('application').customer_wallet_redeem_description } -  ${getConfig('application').orderPrefix }${req.body.order_id} ` : application.wallet_transactions_description,
            amount: req.body.amount,
            type: 'debit',
            status: 'complete',
            wallet_id: req.body.wallet_id
        };

        walletHelper
            .setDataObject(walletTransactionObj)
            .exec()
            .then((resObj) => {
                res.status(200).json(res.fnSuccess(resObj));
            })
            .catch((errObj) => {
                res.status(400).json(res.fnError(errObj));
            });

    },

    orderModifyForPayment_new: async function (paymentResponseData,requestData,status) {        
       
        if (requestData && status) {
            const ordPaymentObj = {
                send_data: '',
                receive_data: JSON.stringify(paymentResponseData),
                payment_status: (status === 'success') ? 'complete' : 'failed',
                transaction_id: (paymentResponseData.id !='') ? paymentResponseData.id : JSON.parse(paymentResponseData).responseStatus._embedded.icsReply.requestId,
            };         
            return await OrderPayment.where('order_id',requestData.order_id).save(ordPaymentObj,{patch:true});            
        } else {
            throw new PermissionDenied();
        }
    },
    orderModifyForPayment: async function (...payObj) {
        let pay = null;
        let reqBody = null;

        
        if (payObj) {
            pay = (payObj.length > 0) ? payObj[0] : null;
            reqBody = (payObj.length > 1) ? payObj[1] : null;
            status = (payObj.length > 2) ? payObj[2] : null;
        }

        if (pay && reqBody && status) {
            console.log(pay.receive,'payreceive');
            
            const ordPaymentObj = {
                send_data: JSON.stringify(pay.sent),
                receive_data: JSON.stringify(pay.receive),
                payment_status: (status === 'success') ? 'complete' : 'failed',
                transaction_id: (pay.receive['soap:Envelope']['soap:Body']['c:replyMessage']['c:merchantReferenceCode']) ? pay.receive['soap:Envelope']['soap:Body']['c:replyMessage']['c:merchantReferenceCode']['_text'] : null,
            };
            return await OrderPayment.where('order_id',reqBody.order_id).save(ordPaymentObj,{patch:true});
        } else {
            throw new PermissionDenied();
        }
    },

    paymentRefund: async function (req, res, next) {
        // let application = Config('application');

        // let userCourseId = _.toInteger(req.params.userCourseId);
        // let orderId = _.toInteger(req.query.order_id);
        // let userId = _.toInteger(req.query.user_id);
        // let courseId = _.toInteger(req.query.course_id);

        // let userCourseData = await UserCourse
        //     .where('id', userCourseId)
        //     .where('order_id', orderId)
        //     .where('user_id', userId)
        //     .where('course_id', courseId)
        //     .whereRaw(`DATE(created_at) > ( DATE_ADD( CURDATE( ), INTERVAL -${application.refund_day_interval} DAY ))`)
        //     .fetch({ withRelated: ['order', 'order.user', 'order.order_details', 'order.order_details.user.profile'] });

        // if ((userCourseData !== undefined) && (userCourseData !== null)) {

        //     let vendorWallet = await PaymentController.getVendorWallet(userCourseData.toJSON());
        //     let userWallet = await PaymentController.getCustomerWallet(userCourseData.toJSON());

        //     if (vendorWallet !== null && userWallet !== null) {
        //         await PaymentController.refundCourseStatusUpdate(userCourseData.toJSON());
        //         res.status(200).json(res.fnSuccess('Refund Successfully'));
        //     }
        //     else {
        //         res.status(400).json(res.fnError('Refund transaction incomplete'));
        //     }
        // }
        // else {
        //     res.status(400).json(res.fnError('Internal Server Error'));
        // }

    },

    getVendorWallet: async function (obj) {
        let application = Config('application');

        if (_.isObject(obj)) {
            let walletId = await PaymentController.getWalletId(obj, 'vendor');
            if (walletId !== null) {
                let walletTransactionObj = _.pickBy({

                    transactionable_type: 'user_courses',
                    transactionable_id: obj.order.id,
                    description: `Vendor ${application.refund_wallet_description} and order no is #SLM100${obj.order.id}`,
                    amount: obj.order.order_details[0].total_price,
                    type: 'debit',
                    status: 'complete',
                    wallet_id: walletId

                }, _.identity);

                walletHelper
                    .setDataObject(walletTransactionObj)
                    .exec()
                    .then((transactionSuccess) => {
                        mailNotification.refundNotificationMailToVendor(obj);
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                return true;
            } else {
                return null;
            }
        }
        else {
            return null;
        }
    },

    getCustomerWallet: async function (obj) {
        let application = Config('application');
        if (_.isObject(obj)) {
            let walletId = await PaymentController.getWalletId(obj.user_id, 'customer');

            if (walletId === null) {
                let userWalletId = await new wallets({ 'user_id': obj.user_id }).save();

                if (userWalletId !== null) {
                    let walletTransactionObj = _.pickBy({

                        transactionable_type: 'user_courses',
                        transactionable_id: obj.order.id,
                        description: `Customer ${application.refund_wallet_description} and order no is #SLM100${obj.order.id}`,
                        amount: obj.order.order_details[0].total_price,
                        type: 'credit',
                        status: 'complete',
                        wallet_id: userWalletId.id

                    }, _.identity);

                    walletHelper
                        .setDataObject(walletTransactionObj)
                        .exec()
                        .then((customerSuccess) => {
                            mailNotification.refundNotificationMailToCustomer(obj);
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    return true;
                }
                else {
                    return null;
                }

            } else {

                let walletTransactionObj = _.pickBy({

                    transactionable_type: 'user_courses',
                    transactionable_id: obj.order.id,
                    description: `Customer ${application.refund_wallet_description} and order no is #SLM100${obj.order.id}`,
                    amount: obj.order.order_details[0].total_price,
                    type: 'credit',
                    status: 'complete',
                    wallet_id: walletId

                }, _.identity);

                walletHelper
                    .setDataObject(walletTransactionObj)
                    .exec()
                    .then((customerSuccess) => {
                        mailNotification.refundNotificationMailToCustomer(obj);
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                return true;
            }
        }
        else {
            return null;
        }
    },

    getWalletId: async function (data, userType) {
        let walletId = await new wallets()
            .where('user_id', (userType === 'vendor') ? data.order.order_details[0].vendor_id : data)
            .fetch({ columns: ['id'] }
            );
        return ((walletId !== undefined && walletId !== null)) ? walletId.id : null;
    },

    refundCourseStatusUpdate: async function (data) {
        UserCourse.where('id', data.id).save({ status: 'cancelled' }, { patch: true })
    },

    sxlAddressGenerate: async function (req, res, next) {
        const API_URL = getEnv('SXL_API_URL');
        request.post(
            API_URL + '/ethgen.php',
            { json: req.body },
            (error, response, body) => {
                if (error) {
                    dd(error);
                    res.status(400).json(res.fnError(error));
                }
                res.status(200).json(res.fnSuccess(body));
            }
        );
    },

    sxlAddressCheck: async function (req, res, next) {
        const API_URL = getEnv('SXL_API_URL');
        request.get({
            url: API_URL + '/checkSXL.php',
            qs: req.params
        }, (error, response, body) => {
            if (error) {
                res.status(400).json(res.fnError(error));
            }
            res.status(200).json(res.fnSuccess(JSON.parse(body)));
        });
    }
}

module.exports = PaymentController;