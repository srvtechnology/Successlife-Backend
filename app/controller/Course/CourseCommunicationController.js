const Validator             = Helper('validator');
const CourseCommunication   = Model('Course/CourseCommunication');

const CourseCommunicationController = {

    index:function(req, res,next){

        let has_course_id           = _.toBoolean(req.query.course_id);
        let course_communication    = CourseCommunication.forge().orderBy('-id');       

        course_communication.fetchAll().then((communications)=>{
            return res.status(200).json(res.fnSuccess(communications));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            wellcome_template   :'required|string',
            congrats_template   :'required|string',
            complete_template   :'required|string',
            course_id           :'required|integer|inDatabase:courses,id',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let communication_data = _.pickBy({
            wellcome_template  :formData.wellcome_template,
            congrats_template  :formData.congrats_template,
            complete_template  :formData.complete_template,
            course_id          :formData.course_id,
        },_.identity)
        
        CourseCommunication.where('course_id',formData.course_id).fetch().then((communication)=>{
            if(communication){
                return communication.save(_.omit(communication_data,'course_id'),{patch:true});
            }else{
                return new CourseCommunication(communication_data).save();
            }
        }).then((communication)=>{
            return res.status(200).json(res.fnSuccess(communication));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:async function(req, res,next){
        
        let communication_id = req.params.id;
        let findBy           = _.isEmpty(req.query.find_by) ? 'id':'course_id';       

        CourseCommunication.where(findBy,communication_id).fetch().then((communication)=>{
            return res.status(200).json(res.fnSuccess(communication));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let communication_id= req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            wellcome_template   :'string',
            congrats_template   :'string',
            complete_template   :'string',
            course_id           :'integer|inDatabase:courses,id',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let communication_data = _.pickBy({
            wellcome_template  :formData.wellcome_template,
            congrats_template  :formData.congrats_template,
            complete_template  :formData.complete_template,
            course_id          :formData.course_id,
        },_.identity)

        CourseCommunication.where('id',communication_id).save(communication_data,{patch:true}).then((communication)=>{
            return res.status(200).json(res.fnSuccess(communication));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let communication_id   = req.params.id;

        CourseCommunication.where('id',communication_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseCommunicationController;