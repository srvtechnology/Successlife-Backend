const OrderDetails  = Model('Order/OrderDetails');
const Bookshelf     = Config('database');
const Order  = Model('Order/Orders');
const OrderPayment  = Model('OrderPayment');
const request = require('request');
const commonFunction = Helper('common');
const moment = require('moment');
const mailNotification = Helper('mail-notification');
const walletTransactions = Model('Wallets/WalletTransactions');
const coursePromotion = Model('Course/CoursePromotions');
const ProductOffer  = Model('ProductOffer');
const User          = Model('User');
const Role          = Model('Role');
const notificationAlert = Helper('notification-alert');
const Payout        = Model('Payout');
const AttendeeInformation = Model('AttendeeInformation');
const generateBarAndQrCode = Helper('generate-bar-and-qr-code.js');
const AttendeeDetail = Model('AttendeeDetail');

const API_URL = getEnv('SXL_API_URL');

const CronController = {

    checkSlxPayment:function(){   

        Order                   
            .whereRaw(`sxl_address IS NOT NULL and order_status =  'pending' and created_at LIKE '%${moment().format('YYYY-MM-DD')}%'`)
            .fetchAll({withRelated:['user','order_details.product_details']})
            .then((success)=>{   
                if(success.length > 0 ){
                    _.map(success.toJSON(),function(v){                                               
                        request.get({ 
                            url: API_URL + `/checkSXL.php?address=${v.sxl_address}`,
                            // url: API_URL + `/checkSXL.php?address=0x9afe43259cb6bc10d5378499f6313d490489ebf5`,
                        }, (error, response, body) => {
                            if (error) {
                                console.log(error);                                
                            }
                            try{                               
                                if(JSON.parse(body)){                                
                                    let sxlStatus = JSON.parse(body).status;
                                    if(sxlStatus == 1 ){  
                                                                                
                                        OrderPayment
                                        .where('order_id',v.id)
                                        .where('payment_mode','SXL')
                                        .orWhere('payment_mode','WSXL')
                                        .save({'payment_status':'complete'},{patch:true})
                                        .then((saveOrderPayment)=>{
                                            Order.where('id',v.id)
                                            .save({"order_status":"complete"},{patch:true})
                                            .then((orderSave)=>{
                                                
                                                mailNotification.OrderConfirmationMail(v.id);
                                                mailNotification.TutorOrderNotificationMail(v.id);
                                                mailNotification.AdminOrderConfirmationMail(v.id);       

                                                CronController.courseWelcomeMail(v.id,v.user_id,v.user.user_name); 
                                               
                                                commonFunction.deductEventTicket(v.id);
                                                commonFunction.generateWallet(v.id);
                                            })                                              
                                        })
                                        .catch((err)=>{
                                            dd(err);
                                        })
                                    }       
                                }
                            }
                            catch(err){
                                mailNotification.cronErrorMailToDev('check slx payment error',JSON.stringify(err));
                            }                            
                        });
                    })
                } 
            })
            .catch((err)=>{
                mailNotification.cronErrorMailToDev('check slx payment error',JSON.stringify(err));
            })         
    },

    checkPendingPayment: function(){ // 1 hour, 6 hours and 12 hours     
        
        Order                   
        .whereRaw(`sxl_address IS NOT NULL and order_status = 'pending' and DATE(ordered_on) = '${moment().format('YYYY-MM-DD')}'`)
        .fetchAll({withRelated:['user','user.profile','order_address','order_address.country','order_address.city','order_address.state','order_details.product_details']})        
        .then((success)=>{   
            if(success.length > 0 ){                
                _.map(success.toJSON(),function(v){       

                    
                    if( `${moment(v.ordered_on).utc().add(1, 'hours').format('YYYY-MM-DD HH:mm:ss')}` == `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`){
                        mailNotification.orderPendingMailToCustomer(v);
                    }
                    if( `${moment(v.ordered_on).utc().add(5, 'hours').format('YYYY-MM-DD HH:mm:ss')}` == `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`){
                        mailNotification.orderPendingMailToCustomer(v);
                    }
                    if( `${moment(v.ordered_on).utc().add(11, 'hours').format('YYYY-MM-DD HH:mm:ss')}` == `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`){
                        mailNotification.orderPendingMailToCustomer(v);
                    }                                                
                })
            }            
        })
        .catch((err)=>{
            dd(err);
            mailNotification.cronErrorMailToDev('check Pending Payment error',JSON.stringify(err));
        })
    },

    courseWelcomeMail: function(orderId,userId,userEmail){         
        OrderDetails
        .where('order_id',orderId)
        .where('productable_type','courses')
        .fetchAll()
        .then((response)=>{
            if(!_.isEmpty(response.toJSON())){
                _.map(response.toJSON(),function(v){                                      
                    mailNotification.CourseWelcomeMailTemplate(orderId,userId,userEmail);     
                })                 
            }            
        })
        .catch((err)=>{
            dd(err)
        })     
    },

    paymentFailedAmountRefundToWallet: function(){

        // only cyber source refund in wallet
        Order            
            .whereRaw(`sxl_address IS NOT NULL and order_status = 'pending' and created_at LIKE '%${moment().subtract(1, 'day').format('YYYY-MM-DD')}%'`)
            .fetchAll({withRelated:['user','order_details.product_details']})
            .then((orderDeails)=>{          
                dd(orderDeails.toJSON());
                if(!_.isEmpty(orderDeails.toJSON())){    
                    _.map(orderDeails.toJSON(),function(v){
                        
                        OrderPayment          
                        .whereRaw(`order_id = ${v.id} and payment_on LIKE '%${moment().subtract(1, 'day').format('YYYY-MM-DD')}%' and  ( payment_mode = 'SXL' OR payment_mode = 'WSXL') group by order_id`)
                        .fetch()
                        .then((paymentResponse)=>{
                            if(!_.isNull(paymentResponse)){                                   
                                let orderPayId = paymentResponse.get('id');

                                Bookshelf.knex.raw(`select fn_check_wallet(${v.user_id}) as check_wallet`)
                                .then((checkWalletResponse)=>{                                     
                                    if(checkWalletResponse){                                       
                                        if(_.isNull(checkWalletResponse[0][0].check_wallet)){            
                                            Bookshelf.knex.raw(`select fn_create_wallet(${v.user_id}) as create_wallet`).then((walletResponse)=>{
                                                
                                                CronController.walletAmountReflect(walletResponse[0][0].create_wallet,v.id,v.total_order_price_usd,orderPayId)
                                            })
                                        }
                                        else
                                        {                                            
                                            CronController.walletAmountReflect(checkWalletResponse[0][0].check_wallet,v.id,v.total_order_price_usd,orderPayId)
                                        }                                        
                                    }
                                })
                                .catch((err)=>{
                                    dd(err);
                                    mailNotification.cronErrorMailToDev('order amount refund error',err);
                                });
                            }
                        })
                        .catch((err)=>{
                            dd(err)
                            mailNotification.cronErrorMailToDev('order amount refund error',err);
                        })                            
                    })                    
                }
            })
            .catch((error)=>{
                dd(error)
                mailNotification.cronErrorMailToDev('order amount refund error',JSON.stringify(err));
            })
    },

    walletAmountReflect: function(walletId,orderId,totalUSDPrice,orderPaymentId){
        
        let walletTransactionsObj = {
            transactionable_type : 'orders',
            transactionable_id   : orderId,
            description          : `${getConfig('application').customer_wallet_refund_description } - ${getConfig('application').orderPrefix }${orderId} `,
            amount               : totalUSDPrice,
            type                 : 'credit',
            status               : 'complete',
            wallet_id            : walletId
        }
        
        new walletTransactions()
        .save(walletTransactionsObj)
        .then((successResponse)=>{
            var rawQuery = "update wallets as w, ( SELECT wallet_id, (SUM(COALESCE(CASE WHEN type = 'credit' THEN amount END,0)) - SUM(COALESCE(CASE WHEN type = 'debit' THEN amount END,0))) balance  FROM wallet_transactions  GROUP BY wallet_id  ) as wt  SET w.amount = wt.balance where wt.wallet_id = w.id and w.id IN (\'"+walletId+"\')";          
            dd(rawQuery)      
            return Bookshelf.knex.raw(rawQuery);
        })
        .then((walletUpdateSuccess)=>{
            dd(orderPaymentId)
            Order.where('id',orderId).save({'order_status':'cancel','created_at':`${moment().format('YYYY-MM-DD H:i:s')}`},{patch:true});

            OrderPayment.where('id',orderPaymentId).save({'payment_status':'failed','payment_on':`${moment().format('YYYY-MM-DD H:i:s')}`},{patch:true});
            
            mailNotification.orderCancellationMailToCustomer(orderId);  // oder failed mail to customer            
            
            CronController.refundEventTicketQuantity(orderId); // refund event ticket quantity

            mailNotification.cronSuccessfullMailToDev('order amount refund successfully');  
        })
        .catch((err)=>{
            dd(err);
            mailNotification.cronErrorMailToDev('order amount refund error',JSON.stringify(err));
        })
    },
    refundEventTicketQuantity: function(orderId){
        OrderDetails
        .where('order_id',orderId)
        .where('productable_type','products')
        .fetchAll()
        .then((response)=>{
            if(!_.isEmpty(response.toJSON())){
                _.map(response.toJSON(),function(v){                      
                    Bookshelf.knex.raw(`UPDATE product_prices SET quantity = ( quantity ) +  ${v.quantity} WHERE  id = ${v.pricable_id} `)
                    .then((r)=>{                        
                        dd(r)
                    })
                    .catch((e)=>{
                        dd(e);
                    })  
                })
            }            
        })
        .catch((err)=>{
            dd(err)
        })
    },
    coursePromitionStatusUpdate: function(){
        coursePromotion
        .where('status','active')
        .whereRaw(`DATE(end_on) < '${moment().format('YYYY-MM-DD')}'`)
        .fetchAll()
        .then((promotionResponse)=>{
            if(promotionResponse.length > 0){
                let promotionIds =  _.map(promotionResponse.toJSON(),'id');                
                coursePromotion.whereIn('id',promotionIds).save({status:'expire'},{patch:true})
                .then((updated)=>{                    
                    mailNotification.cronSuccessfullMailToDev('Course Promition Status Update');  
                })
                .catch((err)=>{
                    mailNotification.cronErrorMailToDev('Error in Course Promition Status Update',JSON.stringify(err));  
                })
            }                        
        })
        .catch((err)=>{
            mailNotification.cronErrorMailToDev('Error in Course Promition Status Update',JSON.stringify(err));  
        })
    },
    productOfferStatusUpdate: function(){

        ProductOffer
        .where('is_expired',0)
        .whereRaw(`DATE(ended_on) < '${moment().format('YYYY-MM-DD')}'`)
        .fetchAll()
        .then((offerResponse)=>{
            if(offerResponse.length > 0){
                let offerIds =  _.map(offerResponse.toJSON(),'id');                
                ProductOffer.whereIn('id',offerIds).save({is_expired:1},{patch:true})
                .then((updated)=>{                    
                    mailNotification.cronSuccessfullMailToDev('Product Offer expired successfull');  
                })
                .catch((err)=>{
                    mailNotification.cronErrorMailToDev('Error in Product Offer Status Update',JSON.stringify(err));  
                })
            }
                     
        })
        .catch((err)=>{
            mailNotification.cronErrorMailToDev('Error in Product Offer',JSON.stringify(err));  
        })
    },
    orderSoftDelete: function(){

        Order
        .whereRaw(`DATE(created_at) = '${moment().subtract(1, 'day').format('YYYY-MM-DD')}' and order_status = 'pending'`)                     
        .fetchAll()
        .then((orderDeleteResponse)=>{
            if(orderDeleteResponse.length > 0){
                let orderIds =  _.map(orderDeleteResponse.toJSON(),'id');     
                Order.whereIn('id',orderIds).save({is_delete:1},{patch:true})
                .then((updated)=>{                    
                    mailNotification.cronSuccessfullMailToDev('Order Soft Deleted');  
                })
                .catch((err)=>{
                    mailNotification.cronErrorMailToDev('Error in Order Soft Deleted',JSON.stringify(err));  
                })
            }            
        })
        .catch((err)=>{
            mailNotification.cronErrorMailToDev('Error in Order Soft Deleted',JSON.stringify(err)); 
        })
    },

    monthlyPayoutGenerate: function(){

        let payoutData = [];       

        let rawQuery = `SELECT wallets.user_id, wallet_transactions. * , (
            SUM( COALESCE(
            CASE WHEN wallet_transactions.type =  "credit"
            THEN wallet_transactions.amount
            END , 0 ) ) - SUM( COALESCE(
            CASE WHEN wallet_transactions.type =  "debit"
            THEN wallet_transactions.amount
            END , 0 ) )
            ) total_amount
            FROM wallet_transactions
            LEFT JOIN wallets ON wallets.id = wallet_transactions.wallet_id
            WHERE YEAR( wallet_transactions.created_at ) = YEAR( '${moment().format('YYYY-MM-DD')}' - INTERVAL 1 MONTH ) AND MONTH( wallet_transactions.created_at ) = MONTH( '${moment().format('YYYY-MM-DD')}' - INTERVAL 1 MONTH ) AND wallet_transactions.wallet_id !=1 AND wallet_transactions.status =  'complete' GROUP BY wallet_transactions.wallet_id`;    

        Bookshelf.knex.raw(rawQuery)
        .then((responseData)=>{
            if(responseData.length > 0){  
                try{ 
                    let res = JSON.parse(JSON.stringify(responseData))[0];
                    _.map(res,function(v){
                        payoutData.push({
                            "wallet_id":v.wallet_id,
                            "user_id":v.user_id,
                            "amount": v.total_amount,
                            "description":`${getConfig('application').payout_description} - ${moment().subtract(1, "month").startOf("month").format('MMMM')} - ${moment().format    ('YYYY')}`,
                            "generate_date":`${moment().format('YYYY-MM-DD')}`,
                            "status":"pending"                                
                        })  
                    })
                    new Payout().batchInsert(payoutData)        
                    .then((response)=>{   
                        mailNotification.adminPayoutNotification();
                        dd(response)
                    })
                    .catch((errors)=>{
                        dd(errors)
                    });
                }
                catch(err){
                    dd(err)
                }                    
            }                
        })
        .catch((e)=>{
            dd(e);
        })
    },
    
    /* Function Name : generateEventTicket 
    * Author : Rituraj Paul
    * Created Date : 09-07-2019
    * Modified Date : *
    * Purpose : Event Ticket Geneartion
    * Params: 
    * Required: 
    * Optional: 
    * Data type: 
    */
    generateEventTicket: async function(){        
        
        AttendeeInformation
        .where('ticket_sent_date',moment().format('YYYY-MM-DD'))
        // .where('ticket_sent_date','2019-07-21')
        .where('ticket_sent_status',0)
        .fetchAll({"withRelated":[
            {   
                "country":function(q){
                    q.select('id','name')
                },
                "event_details":function(q){
                    q.select('id','unique_event_id','start_date','end_date','country_id','state_id','city_id','product_id','banner_image')
                },
                "event_details.product":function(q){
                    q.select('id','title')
                },
                "event_details.country":function(q){
                    q.select('id','name')
                },
                "event_details.state":function(q){
                    q.select('id','name')
                },
                "event_details.city":function(q){
                    q.select('id','name')
                },
                "payment_category":function(q){
                    q.select('id','title')
                }
            },
            "attendee_details",
            "attendee_details.country",
        ]})
        .then((ticketDetails)=>{  
            if(!_.isEmpty( ticketDetails.toJSON() )){
                _.map(ticketDetails.toJSON(),function(detail){ 

                    if(detail.attendee == 1){
                        generateBarAndQrCode.createBarCode(detail)     
                    }
                    else
                    {                        
                        let getdefaultAttendeeDetails = _.filter(detail.attendee_details, function(o) { 
                            return o.is_default; 
                        });
                        if(!_.isEmpty(getdefaultAttendeeDetails)){
                            if(getdefaultAttendeeDetails[0].is_default == 1)
                            {
                                let UpdatedData = {
                                    "first_name":getdefaultAttendeeDetails[0].first_name,
                                    "last_name":getdefaultAttendeeDetails[0].last_name,
                                    "email":getdefaultAttendeeDetails[0].email,
                                    "phone_code":getdefaultAttendeeDetails[0].phone_code,
                                    "phone_number":getdefaultAttendeeDetails[0].phone_number,
                                    "country_id":getdefaultAttendeeDetails[0].country_id,
                                }                              
                                
                                AttendeeDetail
                                    .where('attendee_id',getdefaultAttendeeDetails[0].attendee_id)
                                    .where('is_default',0)
                                    .save(UpdatedData,{patch:true}) 
                                    .then((su)=>{
                                        _.map(detail.attendee_details,(v)=>{
                                            if(v.is_default == 0){
                                                v.first_name = getdefaultAttendeeDetails[0].first_name,
                                                v.last_name = getdefaultAttendeeDetails[0].last_name,
                                                v.email = getdefaultAttendeeDetails[0].email,
                                                v.phone_code = getdefaultAttendeeDetails[0].phone_code,
                                                v.phone_number = getdefaultAttendeeDetails[0].phone_number,
                                                v.country_id = getdefaultAttendeeDetails[0].country_id
                                            }
                                        })                                        
                                        generateBarAndQrCode.createBarCode(detail); 
                                        
                   
                                        AttendeeInformation
                                            .where('id',getdefaultAttendeeDetails[0].attendee_id)
                                            .save({"attendee":1},{patch:true})
                                    })
                                    .catch((err)=>{
                                        dd(err)
                                    })
                            }
                        }                   
                    }              
                })
            }           
        })
        .catch((err)=>{
            dd(err);
        })
    }
}     

module.exports = CronController;