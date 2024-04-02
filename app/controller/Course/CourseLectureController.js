const Validator     = Helper('validator');
const CourseLecture = Model('Course/CourseLecture');

const CourseLectureController = {

    index:function(req, res,next){
        CourseLecture.forge().orderBy('-id').fetchAll().then((lecture)=>{
            return res.status(200).json(res.fnSuccess(lecture));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){

        let formData        = req.body;
        let validation      = new Validator(formData,{
            title               :'required|string|maxLength:250',
            description         :'string',
            short_description   :'string',
            resources           :'string',
            lecture_mode        :'required|string|in:video,pdf',
            lecture_link        :'required|url',
            order_by            :'required|integer',
            course_module_id    :'required|integer|inDatabase:course_modules,id',
            duration            :'required|timeFormate:H:m'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let lecture_data = _.pickBy({
            title               :formData.title,
            description         :formData.description,
            short_description   :formData.short_description,
            resources           :formData.resources,
            lecture_mode        :formData.lecture_mode,
            lecture_link        :formData.lecture_link,
            order_by            :formData.order_by,
            course_module_id    :formData.course_module_id,
            duration            :formData.duration,
        },_.identity)

        new CourseLecture(lecture_data).save().then((lecture)=>{
            return res.status(200).json(res.fnSuccess(lecture));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });

    },

    show:function(req, res,next){
        let lecture_id = req.params.id;

        CourseLecture.where('id',lecture_id).fetch().then((lecture)=>{
            return res.status(200).json(res.fnSuccess(lecture));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 

        let lecture_id      = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title               :'required|string|maxLength:250',
            description         :'string',
            short_description   :'string',
            resources           :'string',
            lecture_mode        :'required|string|in:video,pdf',
            lecture_link        :'required|url',
            order_by            :'required|integer',
            course_module_id    :'integer|inDatabase:course_modules,id',
            duration            :'required|timeFormate:H:m'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let lecture_data = _.pickBy({
            title               :formData.title,
            description         :formData.description,
            short_description   :formData.short_description,
            resources           :formData.resources,
            lecture_mode        :formData.lecture_mode,
            lecture_link        :formData.lecture_link,
            order_by            :formData.order_by,
            course_module_id    :formData.course_module_id,
            duration            :formData.duration,
        },_.identity)

        CourseLecture.where('id',lecture_id).save(lecture_data,{patch:true}).then((lecture)=>{
            return res.status(200).json(res.fnSuccess(lecture));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var lecture_id     = req.params.id;

        CourseLecture.where('id',lecture_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseLectureController;