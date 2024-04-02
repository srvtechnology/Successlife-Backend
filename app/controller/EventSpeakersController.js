const EventSpeakers   = Model('EventSpeakers');
const Validator   = Helper('validator');

const EventSpeakersController = {

    index:function(req, res,next){
        let relationShip    = [];
        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page) : 1; 
        let is_active       = _.toBoolean(req.query.is_active) ? req.query.is_active : false;
        let user_id         = _.toInteger(req.query.user_id) ? req.query.user_id : false;

        let eventSpeaker    =  EventSpeakers.forge().orderBy('-id');  
        
        if(user_id){

            eventSpeaker  = eventSpeaker.where('created_by',user_id) ;
        }
        if(is_active){
            eventSpeaker  = eventSpeaker.where('is_active',1) ;
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign({pageSize:limit,page:page});
            eventSpeaker = eventSpeaker.fetchPage(relation_params);
        }        
        else
        {   
            eventSpeaker = eventSpeaker.fetchAll(Object.assign(relationShip));
        }

        eventSpeaker.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){
        let formData        = req.body;                        
        
        let validationRules = {

            //product_id          : 'required|integer',
            created_by          : 'required|integer',
            name                : 'required|string|unique:event_speakers',
            avatar              : 'string|chkUrlFormate',
            about               : 'string',            
            is_active           :'required|integer',
        };

       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) { 
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_event_ticket = {

            // product_id              : formData.product_id,
            created_by              : formData.created_by,
            name                    : formData.name,
            slug                    : await generateSlug(EventSpeakers,formData.name),
            avatar                  : formData.avatar,
            is_active               : formData.is_active,
            about                   : formData.about
        }

        new EventSpeakers(save_event_ticket).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

       // EventSpeakers.where(findBy,findFor).fetch({withRelated:['product','product.user','product.event','product.event.country','product.event.state','product.event.city','user_created_by']});
       EventSpeakers.where(findBy,findFor).fetch()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData            = req.body;  
        let event_speaker_id    = req.params.id;                      
        
        let validationRules = {

            // product_id          : 'required|integer',
            created_by          : 'integer',
            name                : 'string',
            avatar              : 'string|chkUrlFormate',
            about               : 'string',
            is_active           :'integer',
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_event_ticket ={

            //product_id              : formData.product_id,
            created_by              : formData.created_by,
            name                    : formData.name,
            avatar                  : formData.avatar,
            is_active               : formData.is_active,
            about                   : formData.about
            
        };

        if(formData.logged_in_user_id != 1){
            if(await EventSpeakers.where('id',event_speaker_id).where('created_by',formData.logged_in_user_id).count() === 0){
                return res.status(400).json(res.fnError(`You don't have a permission to edit this speaker!`));
            }
        }   

        EventSpeakers.where('id',event_speaker_id).save(update_event_ticket,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var event_speaker_id  = req.params.id;
        
        EventSpeakers.where('id',event_speaker_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = EventSpeakersController; 