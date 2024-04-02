const Validator   = Helper('validator');
const CourseTime  = Model('Course/CourseTime');

const CourseTimeController = {

    index:function(req, res,next){
        CourseTime.forge().orderBy('-id').fetchAll().then((times)=>{
            return res.status(200).json(res.fnSuccess(times));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            name   :'required|string|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let time_data = {
            name  :formData.name,
        }

        new CourseTime(time_data).save().then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let time_id = req.params.id;

        CourseTime.where('id',time_id).fetch().then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let time_id         = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            name   :'required|string|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let time_data = {
            name  :formData.name,
        }

        CourseTime.where('id',time_id).save(time_data,{patch:true}).then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let time_id         = req.params.id;

        CourseTime.where('id',time_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseTimeController;