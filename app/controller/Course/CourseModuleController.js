const Validator     = Helper('validator');
const CourseModule  = Model('Course/CourseModule');

const CourseModuleController = {

    index:function(req, res,next){
        
        CourseModule.forge().orderBy('-id').fetchAll().then((modules)=>{
            return res.status(200).json(res.fnSuccess(modules));
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
            order_by            :'integer',
            course_id           :'required|integer|inDatabase:courses,id'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let module_data = _.pickBy({
            title               :formData.title,
            description         :formData.description,
            short_description   :formData.short_description,
            resources           :formData.resources,
            order_by            :formData.order_by,
            course_id           :formData.course_id
        },_.identity)

        new CourseModule(module_data).save().then((modules)=>{
            return res.status(200).json(res.fnSuccess(modules));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let module_id = req.params.id;

        CourseModule.where('id',module_id).fetch().then((module)=>{
            return res.status(200).json(res.fnSuccess(module));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        let module_id       = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title               :'required|string|maxLength:250',
            description         :'string',
            short_description   :'string',
            resources           :'string',
            order_by            :'integer',
            course_id           :'integer|inDatabase:courses,id'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let module_data = _.pickBy({
            title               :formData.title,
            description         :formData.description,
            short_description   :formData.short_description,
            resources           :formData.resources,
            order_by            :formData.order_by,
            course_id           :formData.course_id
        },_.identity)

        CourseModule.where('id',module_id).save(module_data,{patch:true}).then((modules)=>{
            return res.status(200).json(res.fnSuccess(modules));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        }); 
    },

    destroy:function(req,res,next){
        
        var module_id     = req.params.id;

        CourseModule.where('id',module_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseModuleController;