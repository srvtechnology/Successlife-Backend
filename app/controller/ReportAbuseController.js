const Validator   = Helper('validator');
const ReportAbuse = Model('ReportAbuse');

const ReportAbuseController = {

    index:function(req, res,next){
        ReportAbuse.forge().orderBy('-id').fetchAll().then((abuses)=>{
            return res.status(200).json(res.fnSuccess(abuses));
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

        let abuse_data = {
            title  :formData.title,
        }

        new ReportAbuse(abuse_data).save().then((abuse)=>{
            return res.status(200).json(res.fnSuccess(abuse));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let abuse_id = req.params.id;

        ReportAbuse.where('id',abuse_id).fetch().then((abuse)=>{
            return res.status(200).json(res.fnSuccess(abuse));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let abuse_id         = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title   :'required|string|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let abuse_data = {
            title  :formData.title,
        }

        ReportAbuse.where('id',abuse_id).save(abuse_data,{patch:true}).then((abuse)=>{
            return res.status(200).json(res.fnSuccess(abuse));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let abuse_id   = req.params.id;

        ReportAbuse.where('id',abuse_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }
}

module.exports = ReportAbuseController;