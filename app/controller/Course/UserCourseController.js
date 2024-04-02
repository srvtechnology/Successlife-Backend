const Validator    = Helper('validator');
const UserCourse   = Model('Course/UserCourse');


const UserCourseController = {

    index:function(req, res,next){

        let relationShip    = [];
        let has_course_id   = _.toBoolean(req.query.course_id);
        let has_order_id    = _.toBoolean(req.query.order_id);
        let has_user_id     = _.toBoolean(req.query.user_id);
        let has_image       = _.toBoolean(req.query.images);
        let has_course      = _.toBoolean(req.query.course);
        let reviewCount     = _.toBoolean(req.query.review_count);
        let created_by      = _.toBoolean(req.query.created_by);    
        let group_by        = _.toBoolean(req.query.group_by);
        let has_progress    = _.toBoolean(req.query.course_progress);
        let string               = req.query.string || false;        
        
        let user_course     = UserCourse.forge().orderBy('-id');
        
        if(group_by){
            user_course = user_course
                .query((qb)=>{
                    qb.groupBy('user_courses.id');
                })
        }   

        if(has_user_id){
            user_course = user_course.where('user_courses.user_id',req.query.user_id);
        }
        if(has_progress){
            user_course = user_course
            .query((qb)=>{
                qb.select('user_courses.*','user_course_progresses.id as user_course_progresses_id','courses.title','courses.sub_title') 
                qb.leftJoin('user_course_progresses','user_course_progresses.course_id','user_courses.course_id')                                
                qb.leftJoin('courses','courses.id','user_courses.course_id')                                
                if(string){
                    qb.where('courses.title', 'like', `%${string}%`)
                }
            })
        }
        // if(has_course){
        //     relationShip.push('course');
        // } 
        if(created_by){
            let userData =  {'user':function(q){
                q.select('id')
            },'user.profile':function(q){
                q.select('*')
            }};
            relationShip.push(userData);           
        }
        if(has_image){
                    relationShip.push('course.images');
                }
        if(reviewCount) {
            let reviewMap = {'course.reviews':function(q){
                q.select('id','reviewable_id');                
            }};
            relationShip.push(reviewMap);
        }
        
        if(has_course_id){
            user_course = user_course.where('course_id',req.query.course_id);
        }

        if(has_order_id){
            user_course = user_course.where('order_id',req.query.order_id);
        }

        user_course.fetchAll({withRelated:relationShip}).then((user_courses)=>{
            return res.status(200).json(res.fnSuccess(user_courses));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){

        let formData        = req.body;
        let status          = getConfig('application.user_course_status');
        let validation      = new Validator(formData,{
            section_data            :'required|string',
            lecture_data            :'required|string',
            total_lecture           :'required|integer',
            completed_lecture       :'required|integer',
            is_certificate_issued   :'required|boolean',
            is_archived             :'required|boolean',
            user_id                 :'required|integer|inDatabase:users,id',
            course_id               :'required|integer|inDatabase:courses,id',
            order_id                :'required|integer|inDatabase:orders,id',
            certificate_issued_on   :'required|dateFormat:YYYY-MM-DD',
            status                  :`required|in:${_.join(status,',')}`,
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let user_course_data = _.pickBy({
            section_data            :formData.section_data,
            lecture_data            :formData.lecture_data,
            total_lecture           :formData.total_lecture,
            completed_lecture       :formData.completed_lecture,
            is_certificate_issued   :formData.is_certificate_issued,
            is_archived             :formData.is_archived,
            user_id                 :formData.user_id,
            course_id               :formData.course_id,
            order_id                :formData.order_id,
            certificate_issued_on   :formData.certificate_issued_on,
            status                  :formData.status,
        },_.identity)
        
        new UserCourse(user_course_data).save().then((user_course)=>{
            return res.status(200).json(res.fnSuccess(user_course));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let user_course_id   = req.params.id;
       
        let search_by = _.toBoolean(req.query.search_by);       

        if(search_by){

            UserCourse
            .where('course_id',user_course_id)
            .where('user_id',req.query.user_id)
            .where('status','!=','cancelled')
            .fetch().then((user_course)=>{
                return res.status(200).json(res.fnSuccess(user_course));
            }).catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
        }
        else
        {
            UserCourse.where('id',user_course_id).fetch().then((user_course)=>{
                return res.status(200).json(res.fnSuccess(user_course));
            }).catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
        }
        
    },

    update: async function(req, res,next){ 
        
        let user_course_id  = req.params.id;
        let formData        = req.body;
        let status          = getConfig('application.user_course_status');
        let validation      = new Validator(formData,{
            section_data            :'string',
            lecture_data            :'string',
            total_lecture           :'integer',
            completed_lecture       :'integer',
            is_certificate_issued   :'boolean',
            is_archived             :'boolean',
            user_id                 :'integer|inDatabase:users,id',
            course_id               :'integer|inDatabase:courses,id',
            order_id                :'integer|inDatabase:orders,id',
            certificate_issued_on   :'dateFormat:YYYY-MM-DD',
            status                  :`in:${_.join(status,',')}`,
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let user_course_data = _.pickBy({
            section_data            :formData.section_data,
            lecture_data            :formData.lecture_data,
            total_lecture           :formData.total_lecture,
            completed_lecture       :formData.completed_lecture,
            is_certificate_issued   :formData.is_certificate_issued,
            is_archived             :formData.is_archived,
            user_id                 :formData.user_id,
            course_id               :formData.course_id,
            order_id                :formData.order_id,
            certificate_issued_on   :formData.certificate_issued_on,
            status                  :formData.status,
        },_.identity)

        UserCourse.where('id',user_course_id).save(user_course_data,{patch:true}).then((user_course)=>{
            return res.status(200).json(res.fnSuccess(user_course));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let user_course_id   = req.params.id;

        UserCourse.where('id',user_course_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }
}

module.exports = UserCourseController;