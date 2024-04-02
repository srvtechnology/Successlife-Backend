const Course        = Model('Course/Course');
const Notification  = Model('Notification');
const Validator     = Helper('validator');
const mailNotification = Helper('mail-notification');
const notificationAlert = Helper('notification-alert');
const User = Model('User');
const moment = require('moment');

const NotificationController = {    

    index: async function(req,res,next){

        let relationShip            = [];
        let has_pagination          = _.toBoolean(req.query.pagination);
        let limit                   = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                    = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;     let role                    = _.toBoolean(req.query.role)  ?  req.query.role  : false;         
        let string                  = req.query.string || false;
        let notification            =  Notification.forge().where('is_delete',0).orderBy('-id'); 
        let userId                  = _.toInteger(req.query.userId) ? req.query.userId : false;
        
        if(role){
            notification = notification.where('role',role);
             
            let userDetails = await User.where('id', userId).fetch();
            let userActivateDate = moment(userDetails.toJSON().activated_at).format('YYYY-MM-DD HH:mm:ss');           
            var notifySearchDate = userActivateDate;

            notification = notification.where('created_at', '>', notifySearchDate);
        }
        
        if(string){
            notification = notification.where(function () {
                this.where('data', 'like', `%${string}%`)
                    .orWhere('role', 'like', `%${string}%`)                    
            })
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign({pageSize:limit,page:page},
                {withRelated:relationShip }
            );
            notification = notification.fetchPage(relation_params);
        }
        else
        {            
            notification = notification.fetchAll(Object.assign(
                {withRelated:relationShip})
            ); 
            
            
        }

        notification.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },
    store:async function(req,res,next){

        let formData        = req.body;                        
        let application     = Config('application');

        if (!_.isArray(formData)) {
            return res.status(400).json(res.fnError(`Data must be in array!.`));
        }

        let validation = new Validator({
            items: formData           
        },
            {
                'items'                 : 'required|array',
                'items.*.entity_id'     : 'integer',
                'items.*.entity_type'   : 'string',
                'items.*.data'          : 'required',
                'items.*.type'          : `required|in:${application.notification_account_type.join(',')}`,
                'items.*.role'          : `required|in:${application.notification_role.join(',')}`
            }
        );

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }            
        new Notification().batchInsert(formData)        
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });

    },    

    soft_delete:function(req,res,next){
        
        let notification_id  = req.params.id;        
        
        Notification
        .where('id',notification_id)
        .save({'is_delete':1},{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });

    },

    courseNotificationAlertToAdmin : function(req,res,next){
        
        let courseId              = req.params.course_id;   
        let emailLink             = _.toBoolean(req.query.path) ?  req.query.path : false;        

        if(emailLink === false){
            return res.status(400).json(res.fnError('Path Cannot be blank'));
        }
        let relationData         = [[],''];
        let relationMapping      = {};
        
        relationData[0].push( 'course_modules');        
        relationData[0].push('course_lectures');
        relationData[1] = 'categories';
        relationData[2] = 'course_coupons';
        relationData[3] = 'offer';                
        relationData[7] = 'user.user_announcements';
        relationData[5] = 'images';
        relationData[6] = 'course_standers';
        
        relationData[4] = {'user':function(q){
            q.select('id','user_name','avatar')
        },'user.profile':function(q){
            q.select('id','user_id','first_name','middle_name','last_name','head_line')
        }};
       
        let mapData = _.map(relationData,(v)=>{
            return _.isArray(v) ? _.join(v,'.') : v;
        })

        let mapDataArray = _.remove(mapData,(v) => !_.isEmpty(v));

        relationMapping = {
            withRelated: mapDataArray
        }
        
        Course
        .where('id',courseId)
        .where('mail_status',0)
        .fetch(relationMapping)
        .then((course)=>{           
            if(course !== null){                                

                Course.where('id',courseId).save({ mail_status:1 },{ patch:true })
                .then((course_update)=>{ 
                    /* Mail notification*/
                    mailNotification.courseNotificationMailToAdmin(course,emailLink);
                    
                    /* System generated notification*/
                    notificationAlert.courseNotificationAlertToAdmin(courseId,course);                    
                })                    
                .catch((errors)=>{
                    console.log(errors);
                })               
            }           
            return res.status(200).json(res.fnSuccess(course));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }
    
}

module.exports = NotificationController;