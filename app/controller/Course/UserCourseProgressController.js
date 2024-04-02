const Validator            = Helper('validator');
const UserCourseProgress   = Model('Course/UserCourseProgress');

const UserCourseProgressController = {

    index:function(req, res,next){

        let user_id             = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let course_id           = _.toInteger(req.query.course_id) ? req.query.course_id : false;
        let order_id            = _.toInteger(req.query.order_id) ? req.query.order_id : false;
        let course_lecture_id   = _.toInteger(req.query.course_lecture_id) ? req.query.course_lecture_id : false;
        let is_complete         = _.toBoolean(req.query.is_complete) ? req.query.is_complete : false;
        
        let progress = UserCourseProgress.forge().orderBy('-id');
        if(is_complete){
            progress.where('is_complete',is_complete)
        }
        if(user_id){
            progress.where('user_id',user_id)
        }
        if(course_id){  
            progress.where('course_id',course_id)
        }        
        if(course_lecture_id){
            progress.where('course_lecture_id',course_lecture_id)
        }
        progress.fetchAll().then((progresses)=>{
            return res.status(200).json(res.fnSuccess(progresses));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            user_id            :    'required|integer|inDatabase:users,id',
            course_id          :    'required|integer|inDatabase:courses,id',
            user_course_id     :    'required|integer|inDatabase:user_courses,id',
            course_module_id   :    'required|integer|inDatabase:course_modules,id',
            course_lecture_id  :    'required|integer|inDatabase:course_lectures,id',
            is_complete        :    'required|boolean',
            read_time          :    'required|timeFormate:H:m'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        UserCourseProgress
            .where('user_id',formData.user_id)
            .where('course_id',formData.course_id)
            .where('user_course_id',formData.user_course_id)
            .where('course_module_id',formData.course_module_id)
            .where('course_lecture_id',formData.course_lecture_id)                                            
            .count()
            .then((success)=>{                
                if(success === 0){
                    console.log(success);
                    let course_progress_data = {
                        user_id             :formData.user_id,
                        course_id           :formData.course_id,
                        user_course_id      :formData.user_course_id,
                        course_module_id    :formData.course_module_id,
                        course_lecture_id   :formData.course_lecture_id,
                        is_complete         :formData.is_complete,
                        read_time           :formData.read_time
                    };
                    
                    new UserCourseProgress(course_progress_data).save().then((progress)=>{
                        return res.status(200).json(res.fnSuccess(progress));
                    }).catch((errors)=>{
                        return res.status(400).json(res.fnError(errors));
                    });
                }   
                else{
                    return res.status(400).json(res.fnError('Record Found!'));
                }                
            })
            .catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            })                                           
    },

    show:function(req, res,next){
        let progress_id = req.params.id;

        UserCourseProgress.where('id',progress_id).fetch().then((progress)=>{
            return res.status(200).json(res.fnSuccess(progress));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let progress_id     = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            user_id            :'integer|inDatabase:users,id',
            course_id          :'integer|inDatabase:courses,id',
            user_course_id     :'integer|inDatabase:user_courses,id',
            course_module_id   :'integer|inDatabase:course_modules,id',
            course_lecture_id  :'integer|inDatabase:course_lectures,id',
            is_complete        :'boolean',
            read_time          :    'required|timeFormate:H:m'
        });
 
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let course_progress_data = {
            user_id             :formData.user_id,
            course_id           :formData.course_id,
            user_course_id      :formData.user_course_id,
            course_module_id    :formData.course_module_id,
            course_lecture_id   :formData.course_lecture_id,
            is_complete         :formData.is_complete,
            read_time           :formData.read_time
        };

        UserCourseProgress.where('id',progress_id).save(course_progress_data,{patch:true}).then((progress)=>{
            return res.status(200).json(res.fnSuccess(progress));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let progress_id   = req.params.id;

        UserCourseProgress.where('id',progress_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = UserCourseProgressController;