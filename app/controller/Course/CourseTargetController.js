const Validator   = Helper('validator');
const CourseTarget= Model('Course/CourseTarget');

const CourseTargetController = {

    index:async function(req, res,next){

        let realtionBuild   = {};
        let has_answer      = _.toBoolean(req.query.answer); 
        let course_id       = _.toBoolean(req.query.course_id);
        let course_target   = CourseTarget.forge().orderBy('-id');       
        
        if(has_answer && course_id){

            course_id = req.query.course_id;
            realtionBuild = {
                withRelated:{'course_answer':function(q){
                    q.where('course_id',course_id);
                }}
            }
        }

        course_target.fetchAll(realtionBuild).then((target)=>{
            return res.status(200).json(res.fnSuccess(target));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            question   :'required|string',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let target_data = {
            question  :formData.question,
        }

        new CourseTarget(target_data).save().then((target)=>{
            return res.status(200).json(res.fnSuccess(target));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let target_id = req.params.id;

        CourseTarget.where('id',target_id).fetch().then((target)=>{
            return res.status(200).json(res.fnSuccess(target));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let target_id       = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            question   :'required|string',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let target_data = {
            question  :formData.question,
        }

        CourseTarget.where('id',target_id).save(target_data,{patch:true}).then((target)=>{
            return res.status(200).json(res.fnSuccess(target));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let target_id   = req.params.id;

        CourseTarget.where('id',target_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseTargetController;