const Validator   = Helper('validator');
const Contact     = Model('Contact');
const ContactMail = Mail('Contact');

const ContactController = {

    index:function(req, res,next){
        Contact.forge().orderBy('-id').fetchAll().then((contacts)=>{
            return res.status(200).json(res.fnSuccess(contacts));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){

        let formData        = req.body;
        let validation      = new Validator(formData,{
            name        :   'required|string|maxLength:250',
            email       :   'required|email',
            mobile_no   :   'required|string|maxLength:20',
            message     :   'required|string',
            phone_code  :   'required|numeric|maxLength:5'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let contact_data = _.pickBy({
            name        :formData.name,
            email       :formData.email,
            mobile_no   :formData.mobile_no,
            message     :formData.message,
            phone_code  :formData.phone_code
        },_.identity)

        new Contact(contact_data).save().then((contact)=>{

            ContactMail(contact).then((response)=>{
                dd(response)
                return res.status(200).json(res.fnSuccess(contact)); 
            }).catch((errors) =>{
                dd(errors)
                return res.status(400).json(res.fnError(errors,'Something wrong please try again after some time.'));
            })
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let contact_id = req.params.id;

        Contact.where('id',contact_id).fetch().then((contact)=>{
            return res.status(200).json(res.fnSuccess(contact));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let contact_id      = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            name        :'string|maxLength:250',
            email       :'email',
            mobile_no   :'string|maxLength:20',
            message     :'string',
            phone_code  : 'required|string|maxLength:5'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let contact_data = _.pickBy({
            name        :formData.name,
            email       :formData.email,
            mobile_no   :formData.mobile_no,
            message     :formData.message,
            phone_code  :formData.phone_code
        },_.identity)

        Contact.where('id',contact_id).save(contact_data,{patch:true}).then((contact)=>{
            return res.status(200).json(res.fnSuccess(contact));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let contact_id  = req.params.id;

        Contact.where('id',contact_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = ContactController;