const Notification  = Model('Notification');
const Course = Model('Course/Course');
const mailNotification = Helper('mail-notification');
const Profile = Model('Profile');
const CourseDiscussion  = Model('Course/CourseDiscussion');
const UserCourse = Model('Course/UserCourse');
const Category = Model('Category');
const Product = Model('Product/Product');
const moment = require('moment');

const notificationAlert = {

    courseNotificationAlertToAdmin: async function (courseId,data) {
        let notifyToAdmin = {
            'entity_id':courseId,
            'entity_type':'courses',
            'data':`${data.toJSON().title} has been created by ${data.toJSON().user.profile.full_name}`,
            'sender_id':data.toJSON().created_by,
            'role':'admin',
            'type':'system_generated'
        }
        new Notification(notifyToAdmin).save(); 
    },

    orderSuccessNotifyToAdmin: async function(orderId,data){

        let notifyToAdmin = {
            'entity_id':orderId,
            'entity_type':'orders',
            'data':`Hooray – New Order is purchased on SuccessLife - #SLM100${orderId}`,
            'sender_id':data.user_id,
            'role':'admin',
            'type':'system_generated'
        }
        new Notification(notifyToAdmin).save();
    },

    diableNotify: async function(data,tableName){
        let productDetails= null;
        let contactUsLink = `${getConfig('application').email.url}contact`; 

        switch (tableName) {
            case 'courses':
                productDetails = await Course.where('id',data.id).fetch({withRelated:['user','user.profile']});                                            
            break;
            case 'categories':
                productDetails = await Category.where('id',data.id).fetch();                
            break;
            case 'event_tickets':            
                productDetails = await Product.where('id',data.id).where('product_type','event_ticket').fetch({withRelated:['user','user.profile']});                
            break;
            default:
                console.log('nothing');
        }             
        if(productDetails !== undefined && productDetails !== null){
            let notify = {
                'entity_id':data.id,
                'entity_type':data.table,
                'data':`${productDetails.toJSON().title} has been disabled by ${data.userType}`,
                'sender_id':data.sender_id,
                'role':(data.userType === 'admin' ) ? 'vendor' : 'admin',
                'type':'system_generated'
            }
            new Notification(notify).save();
            mailNotification.diableNotifyMail(productDetails.toJSON(),data.userType,contactUsLink);
        }
    }, 

    softDeleteNotify: async function(data,tableName){
        let productDetails= null;
        switch (tableName) {
            case 'courses':
                productDetails = await Course.where('id',data.id).fetch({withRelated:['user','user.profile']});       
            break;
            case 'event_tickets':            
                productDetails = await Product.where('id',data.id).where('product_type','event_ticket').fetch({withRelated:['user','user.profile']});                
            break;
            default:
            console.log('nothing');
        }
       
        if(productDetails !== undefined && productDetails !== null){
            let notify = {
                'entity_id':data.id,
                'entity_type':data.table,
                'data':`${productDetails.toJSON().title} has been deleted by ${data.userType}`,
                'sender_id':data.sender_id,
                'role':(data.userType === 'admin' ) ? 'vendor' : 'admin',
                'type':'system_generated'
            }
            new Notification(notify).save();
            mailNotification.softDeleteNotifyMail(productDetails.toJSON(),data.userType);
        } 
    },

    announcementNotify: async function(data,userType,id){

        let getTutorName = await Profile.where('user_id',data.user_id).fetch();            

        let notify = {
            'entity_id':id,
            'entity_type':'user_announcements',
            'data':`${data.title} has been created by ${getTutorName.toJSON().full_name}`,
            'sender_id':data.user_id,
            'role':(userType === 'customer' ) ? 'customer' : 'admin',
            'type':'system_generated'
        }
        new Notification(notify).save();
    },

    courseDiscussionAlert: async function (data,userType,id){

        let getFullName = await Profile.where('user_id',data.user_id).fetch();
        let message = null;
        if(data.course_discussions_id !== undefined){
            let getQuestion = await CourseDiscussion.where('id',data.course_discussions_id).fetch();       
            message = `${getFullName.toJSON().full_name} replied to the question: ${getQuestion.toJSON().title}`;
        }            
        else 
        {
            message = `${getFullName.toJSON().full_name} posted to the question: ${data.title}`;
        }
        

        let notify = {
            'entity_id':id,
            'entity_type':'course_discussions',
            'data':message,
            'sender_id':data.user_id,
            'role':(userType === 'customer' ) ? 'customer' : 'vendor',
            'type':'system_generated'
        }
        new Notification(notify).save();
    },

    courseCompleteNotify: async function(userCourseId){

        let getDetails = await UserCourse.where('id',userCourseId).fetch({"withRelated":["user",'user.profile','course']});        

        let notify = {
            'entity_id':userCourseId,
            'entity_type':'user_courses',
            'data':`${getDetails.toJSON().user.profile.full_name} has been completed the course "${getDetails.toJSON().course.title}"`,
            'sender_id':getDetails.toJSON().user_id,
            'role':'vendor',
            'type':'system_generated'
        }
        new Notification(notify).save();
    },

    reviewNotify: async function(data,reviewId){
        let getFullName = await Profile.where('user_id',data.user_id).fetch();
        let courseName = null;

        if(data.reviewable_type === 'courses'){
            courseName =  await Course.where('id',data.reviewable_id).fetch();
        }   
         
        let notify = {
            'entity_id':reviewId,
            'entity_type':'reviews',
            'data':`${getFullName.full_name} given ${data.rating_id} ratings in ${courseName.toJSON().title}`,
            'sender_id':data.user_id,
            'role':'vendor',
            'type':'system_generated'
        }
        new Notification(notify).save();
    },  

    resellerAppliedForProduct: async function(courseData,userData,formData){
        let courseObj = courseData.toJSON();
        _.map(courseObj,function(value,index){ 
                             
            let dataArr = {   
                entity_id: formData.data[index].product_id,
                entity_type: 'reseller_product',                
                data:`${userData.first_name} ${userData.last_name} want to resell this course ( ${value.title} ) on ${moment().format('YYYY-MM-DD')} `,
                sender_id: formData.user_id,
                role: 'admin',
                type: 'system_generated'
            }
            new Notification(dataArr).save();                            
        }) 
    },

    resellerProductApproved: async function(data,approvedBy){
        _.map(data,function(value,index){ 
                             
            let dataArr = {   
                entity_id: value.product_id,
                entity_type: 'reseller_product',                
                data:`Admin has been approved your product on ${moment().format('YYYY-MM-DD')} `,
                sender_id: approvedBy,
                role: 'reseller',
                type: 'system_generated'
            }
            new Notification(dataArr).save();                            
        }) 
    }
}

module.exports = notificationAlert; 