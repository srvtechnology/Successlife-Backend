const Validator   = Helper('validator');
const CourseStander  = Model('Course/CourseStander');

const CourseStanderController = {

    index:function(req, res,next){
        CourseStander.forge().orderBy('-id').fetchAll().then((standers)=>{
            return res.status(200).json(res.fnSuccess(standers));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title   :'required|string|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let time_data = {
            title  :formData.title,
        }

        new CourseStander(time_data).save().then((stander)=>{
            return res.status(200).json(res.fnSuccess(stander));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let time_id = req.params.id;

        CourseStander.where('id',time_id).fetch().then((stander)=>{
            return res.status(200).json(res.fnSuccess(stander));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let time_id         = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title   :'required|string|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let time_data = {
            title  :formData.title,
        }

        CourseStander.where('id',time_id).save(time_data,{patch:true}).then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let time_id         = req.params.id;

        CourseStander.where('id',time_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseStanderController;