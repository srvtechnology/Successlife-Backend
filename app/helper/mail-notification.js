const CourseWelcomeConfirmation = Mail('CourseWelcomeConfirmation');
const eventConfirmationMailView = Mail('EventConfirmationMailView');
const VendorOrderConfirmation = Mail('VendorOrderConfirmation');
const Order = Model('Order/Orders');
const OrderPayment = Model('OrderPayment');
const OrderDetail = Model('Order/OrderDetails');
const Payout = Model('Payout');
const Product = Model('Product/Product');
const Events = Model('Product/Event');
const Course = Model('Course/Course');
const UserCourse = Model('Course/UserCourse');
const CourseCommunication = Model('Course/CourseCommunication');
const AdminNotificationOrderMail = Mail('AdminNotificationOrderMail');
const CourseNotificationOrderMailToAdmin = Mail('CourseNotificationOrderMailToAdmin');
const RefundNotificationMailToVendor = Mail('RefundNotificationMailToVendor');
const RefundNotificationMailToCustomer = Mail('RefundNotificationMailToCustomer');
const DiableNotifyMail = Mail('DiableNotifyMail');
const DeleteNotifyMail = Mail('DeleteNotifyMail');
const CronSuccessfullMailToDev = Mail('CronSuccessfullMailToDev');
const CronErrorMailToDev = Mail('CronErrorMailToDev');
const VendorAgreementMail = Mail('VendorAgreementMail');
const VendorAcceptAgreementMailToAdmin = Mail('VendorAcceptAgreementMailToAdmin');
const RefundMailToCustomer = Mail('RefundMailToCustomer');
const SxlPaymentFailedMailToCustomer = Mail('SxlPaymentFailedMailToCustomer');
const FailedMailToCustomer = Mail('FailedMailToCustomer');
const OrderPendingMailToCustomer = Mail('OrderPendingMailToCustomer');
const OrderCancelMailToCustomer = Mail('OrderCancelMailToCustomer');
const AdminPayoutNotification = Mail('AdminPayoutNotification');
const PayoutReleased = Mail('PayoutReleased');
const invoiceGeneration = Helper('invoice-generation');
const EventTicketView = Mail('EventTicketView');

const mailNotifications = {
 
    OrderConfirmationMail : async function(orderId){                
        Order
            .where('id',orderId)            
            .fetch({'withRelated': ['user','user.profile','order_address','order_address.user','order_address.user.profile','order_address.country','order_address.city','order_address.state','order_details.product_details','order_details.payment_type']})
            .then((details)=>{
            if(details !== undefined){                   
                invoiceGeneration.invoice(details.toJSON());                             
            }            
        })   
        .catch((err)=>{
            console.log(err);
        })   
    },
    CourseWelcomeMailTemplate: async function(orderId,userId,userEmail){       
        let course_id = await OrderDetail
            .where('order_id',orderId)
            .where('productable_type','courses')
            .fetchAll({columns: ['productable_id']});
           
        if(course_id.length > 0){
            let courseIdObj = _.map(course_id.toJSON(),'productable_id'); 
          
            let courseMailData = await CourseCommunication
                .whereIn('course_id',courseIdObj)
                .fetchAll({'withRelated':['course','course.user','course.user.profile']})
            if(courseMailData.length > 0){         
                _.map(courseMailData.toJSON(),function(v){                 
                    let mailData = {
                        'welcome_template': v.wellcome_template,
                        'tutor_name':v.course.user.profile.full_name,
                        'customer_email':userEmail                     
                    };                        
                    CourseWelcomeConfirmation(mailData,userEmail);
                })
                
                Course
                .select('id')
                .whereIn('id', courseIdObj)
                .withCount('course_modules.course_lectures as lecture_count')
                .fetchAll()
                .then((course) => {
                    if (course.length > 0) {
                        let user_course = [];
                        _.map(course.toJSON(), function (v) {
                            user_course.push({
                                'status': 'enrolled',
                                'user_id': userId,
                                'course_id': v.id,
                                'order_id': orderId,
                                'total_lecture': v.lecture_count
                            })
                        })
                        new UserCourse().batchInsert(user_course); 
                    }                                            
                })
                .catch((err) => {                        
                    console.log(err);
                })
            }                                
        }                          
    },
    eventConfirmationMailTemplate:async function(userObj,productId,qty,attendeeInfoEncryptStr){     
       
        Product
        .where('id',productId)
        .fetch()
        .then((productDetails)=>{
            if(productDetails !== undefined && productDetails !== null){             
                if(productDetails.toJSON().product_type === 'event_ticket'){
                    Events
                    .where('product_id',productDetails.toJSON().id)
                    .fetch({withRelated:['country','city','state']})
                    .then((evetDetails)=>{                       
                        eventConfirmationMailView(evetDetails.toJSON(),userObj,productDetails.toJSON(),qty,attendeeInfoEncryptStr);                                            
                    })
                    .catch((err)=>{
                        dd(err)
                    })
                }
            }
        })
        .catch((err)=>{
            dd(err)
        })
    },

    TutorOrderNotificationMail: async function(orderId){
       
        OrderDetail                            
        .where('order_id',orderId)                                       
        .fetchAll()
        .then((orderDetailsRespnse)=>{
            let vendorDetails = _.map(orderDetailsRespnse.toJSON(), 'vendor_id');           
            _.map(vendorDetails,function(v){
                mailNotifications.getVendorOrderDetails(v,orderId);                  
            })
        })  
        .catch((err)=>{
            dd(err);
        })        
    },
    getVendorOrderDetails:async function(vendorId,orderId){        
        OrderDetail                            
        .where('vendor_id',vendorId)                                       
        .where('order_id',orderId)     
        .fetch({
            withRelated: [
                { 
                    'user': function(qb){
                        qb.select('id','user_name as tutor_email')
                    }                                            
                },
                'order',
                'order.user.profile',
                'product_details'
            ]
        })
        .then((vendorDetails)=>{
            VendorOrderConfirmation(vendorDetails.toJSON());            
           
        })
        .catch((err)=>{
            dd(err);
        })
    },

    AdminOrderConfirmationMail: async function(orderId){      
        let details = await OrderDetail
                            .where('order_id',orderId)
                            .fetchAll({'withRelated':['product_details','user','user.profile','order']});         
        if(details.length > 0){
            _.map(details.toJSON(),function(val){  
                AdminNotificationOrderMail(val);                             
            })
        }           
    },     

    courseNotificationMailToAdmin: async function(data,link){
        CourseNotificationOrderMailToAdmin(data,link)
    },

    refundNotificationMailToVendor: async function(data){
        RefundNotificationMailToVendor(data)
    },

    refundNotificationMailToCustomer: async function(data){
        RefundNotificationMailToCustomer(data)
    },

    diableNotifyMail: async function(data,userType,contactUsLink){
        DiableNotifyMail(data,userType,contactUsLink);
    },

    softDeleteNotifyMail: async function(data,userType){
        DeleteNotifyMail(data,userType);
    }, 
    cronSuccessfullMailToDev: async function(type){        
        CronSuccessfullMailToDev(type);
    },

    cronErrorMailToDev: async function(type,data){        
        CronErrorMailToDev(type,data);
    },

    vendorAgreementMail: async function(formData, userData){
        VendorAgreementMail(formData,userData.toJSON());
        VendorAcceptAgreementMailToAdmin(formData,userData.toJSON());
    },
    refundMailToCustomer: async function(orderId,amount){ 
        Order.where('id',orderId).fetch({withRelated:['user','user.profile']}).then((response)=>{            
            if(typeof response == 'object'){                
                RefundMailToCustomer(response.toJSON(),amount)
            };            
        }) 
    },
    orderFailedMailToCustomer: async function(orderId,errorMessage,cntctLink,myOrderLink){   
        OrderPayment.where('order_id',orderId).where('payment_status','failed').fetch({'columns':'price_type'})
        Order.where('id',orderId).fetch({withRelated:['order_details','order_payments','user','user.profile']}).then((response)=>{            
         
            if(typeof response == 'object'){      
                // JSON.parse(errorMessage).responseStatus.message
                FailedMailToCustomer(response.toJSON(),errorMessage,cntctLink,myOrderLink)
            };            
        }) 
    },
    sxlPaymentFailedMailToCustomer:async function(orderId){
        Order.where('id',orderId).fetch({withRelated:['user','user.profile']}).then((response)=>{            
            if(typeof response == 'object'){                
                SxlPaymentFailedMailToCustomer(response.toJSON())
            };            
        })
    },
    orderPendingMailToCustomer: async function(details){ 
        OrderPendingMailToCustomer(details);
    },
    orderCancellationMailToCustomer: async function(orderId){
        Order.where('id',orderId).fetch({withRelated:['user','user.profile']})
        .then((response)=>{            
            if(typeof response == 'object'){                        
                OrderCancelMailToCustomer(response.toJSON());               
            };            
        }) 
    },
    adminPayoutNotification: function(){
        AdminPayoutNotification();
    },
    payoutReleased: function(payoutId){
        Payout.where('id',payoutId).where('status','complete').fetch({withRelated:['user','user.profile']})
        .then((success)=>{
            PayoutReleased(success.toJSON());
        })
        .catch((error)=>{
            dd(error);
        })        
    },
    eventTicket: function(detail,eventDetail,product,paymentCategory,country,state,city){
        EventTicketView(detail,eventDetail,product,paymentCategory,country,state,city)
        .then((r)=>{
            console.log(r)
        })
        .catch((s)=>{
            console.log(s)
        })       
    }
}


module.exports = mailNotifications; 