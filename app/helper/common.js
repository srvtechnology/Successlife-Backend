const Orders = Model('Order/Orders');
const mailNotification = Helper('mail-notification');
const notificationAlert = Helper('notification-alert');
const wallets = Model('Wallets/Wallets');
const walletHelper = Helper('wallet');
const OrderDetails = Model('Order/OrderDetails');
const Bookshelf = Config('database');
const ProductPrice = Model('ProductPrice');
const Setting = Model('Setting');

const commonFunction = {   

    generateWallet: async function(orderId){  
        let vendorCommunicationRate = await Setting.where('access_key','vendor_commission').fetch();
        let resellerCommunicationRate = await Setting.where('access_key','reseller_commission').fetch();        
        Bookshelf.knex.raw(`CALL sp_wallet_details(${orderId},${vendorCommunicationRate.get('value')},${resellerCommunicationRate.get('value')},"${getConfig('application').vendor_wallet_transactions_description} -  ${getConfig('application').orderPrefix }${orderId} ")`).then((response)=>{
            dd(response);
        }).catch((err)=>{
            dd(err);
        });
    },

    paymentUpdate: async function (data) {      

        const itemArr = data.order_details.map((el) => {
            const elm = {
                name: el.product_details.title,
                quantity:1,
                price:el.product_details.price,
                currency:"USD",
                type:(el.productable_type === 'courses') ? 'courses':'products',
            };
            return elm;
        });      
        
        const elm = {
            order_id: data.id,
            payment_status:"complete",
            order_status:"complete",
            received_data:"",
            user_id:data.user_id,
            items:itemArr,
            shipping_price:0,
            discount:data.total_discount_price,
            total:data.total_order_price,
            order_date:data.created_at,
            customer_email:data.user.email,
            customer_phone:data.user.mobile_no
        };

        let update_status = _.pickBy({

            payment_status: 'complete',
            order_status: 'complete',
            received_data: '',
            is_delete: 0
        }, _.identity);

        Orders.where('id', data.id).save(update_status, { patch: true })
        .then((response)=>{                
            if (response.toJSON().payment_status === 'complete') {
                mailNotification.CustomerOrderConfirmationMail(elm);
                mailNotification.CourseWelcomeMail(elm);                                              
                mailNotification.TutorOrderNotificationMail(elm);
                mailNotification.AdminOrderConfirmationMail(elm);
                mailNotification.invoiceMail(elm);
                notificationAlert.orderSuccessNotifyToAdmin(data.id, elm);
                mailNotification.cronSuccessfullMailToDev('slx payment update');
            }
        })
        .catch((err)=>{
            mailNotification.cronErrorMailToDev('slx payment update error',err);           
        })    
    },

    createVendorWallet: async function(data,order_id){
        let application = Config('application');

        let walletData = data.toJSON();
        let walletObj = _.isObject(walletData) ? walletData : false;

        if (walletObj) {
            let walletUserId = _.map(walletData, 'vendor_id');
            let walletArr = [];
            _.map(walletObj, function (v) {
                walletArr.push({
                    'id': v.wallet_id,
                    'user_id': v.vendor_id
                })
            })
            let checkWallet = await new wallets().createOrUpdateWallet(walletArr, ['user_id']);
            if(checkWallet !== undefined && checkWallet !== null){
                let getWallet = await new wallets().whereIn('user_id', walletUserId).fetchAll();
                if (getWallet.length > 0 && getWallet !== undefined && getWallet !== null ) {
                    let walletUserDataObj = _.isObject(getWallet) ? getWallet.toJSON() : false;
                    _.map(walletUserDataObj, function (v, i) {
                       let elemData = {
                            'transactionable_type': 'orders',
                            'transactionable_id': order_id,
                            'description': application.wallet_transactions_description,
                            'amount': walletObj[i].totalAmount,
                            'type': (walletObj[i].productable_type === 'course_promotions') ? 'debit': 'credit',
                            'status': 'complete',
                            'wallet_id': v.id
                        }
                       walletHelper
                            .setDataObject(elemData)
                            .exec();
                    })                   
                    return getWallet.toJSON();
                }  
            }                      
        }        
    },

    courseEditOrderStatusCheck: async function(courseId){       
        if( await OrderDetails.where('productable_type','courses').where('productable_id',courseId).count() > 0){
            return true;
        }
        else{
            return false;
        }
    },
    productEditOrderStatusCheck: async function(productId){
        if( await OrderDetails.where('productable_type','products').where('productable_id',productId).count() > 0){
            return true;
        }
        else{
            return false;
        }
    },
    deductEventTicket : function(orderId){             
        /* Quantity deduct from event ticket */
        OrderDetails
        .where('order_id',orderId)
        .where('productable_type','products')
        .fetchAll()
        .then((response)=>{
            if(!_.isEmpty(response.toJSON())){
                _.map(response.toJSON(),function(v){  
                    
                    Bookshelf.knex.raw(`UPDATE product_prices SET quantity = ( quantity )- ${v.quantity} WHERE  id = ${v.pricable_id} `)
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

    courseWelcomeMail: function(orderId,orderUserDetails){         
        OrderDetails
        .where('order_id',orderId)
        .where('productable_type','courses')
        .fetchAll()
        .then((response)=>{
            if(!_.isEmpty(response.toJSON())){
                _.map(response.toJSON(),function(v){                                      
                    mailNotification.CourseWelcomeMail(v.order_id,orderUserDetails.toJSON().user_id,orderUserDetails.toJSON().user.user_name);    
                })                 
            }            
        })
        .catch((err)=>{
            dd(err)
        })     
    }

}

module.exports = commonFunction; 