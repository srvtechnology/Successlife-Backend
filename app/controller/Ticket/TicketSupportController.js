const TicketSupport   = Model('Ticket/TicketSupport');
const Validator       = Helper('validator');

const TicketSupportController = {

    index:function(req, res,next){

        let relationShip           = [];
        let has_pagination         = _.toBoolean(req.query.pagination);
        let limit                  = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)        : 10;
        let page                   = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)         : 1;
        let is_closed              = req.query.is_closed;
        let fetchTicketCategory    = _.toBoolean(req.query.ticket_categories) ?  'ticket_categories'    : {};
        let fetchProduct           = _.toBoolean(req.query.product) ?  'product_details'                : {};
        let fetchCreatedByUser     = _.toBoolean(req.query.created_by_user) ?  'created_by_user'        : {};
        let fetchClosedByUser      = _.toBoolean(req.query.closed_by_user) ?  'closed_by_user'          : {};
        let fetchCreatedForUser    = _.toBoolean(req.query.created_for_user) ?  'created_for_user'      : {};
        let fetchAll               = _.toBoolean(req.query.all) ? req.query.all                         : false;

        let ticketSupport   =  TicketSupport.forge().orderBy('-id');

        if(is_closed){
            ticketSupport = ticketSupport.where('is_closed',is_closed);
        }

        if(!fetchAll){
            relationShip = {withRelated:[fetchTicketCategory,fetchProduct,fetchCreatedByUser,fetchClosedByUser,fetchCreatedForUser]};
        }
        else{
            relationShip = {withRelated:['ticket_categories','product_details','created_by_user','created_for_user','closed_by_user']};
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign({pageSize:limit,page:page},relationShip);
            ticketSupport = ticketSupport.fetchPage(relation_params);
        }
        else
        {            
            ticketSupport = ticketSupport.fetchAll(Object.assign(relationShip));
        }

        ticketSupport.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){

        let formData        = req.body;        
        let application     = Config('application');         
        let validationRules = {

            ticket_category_id            : 'required|integer', 
            created_by                    : 'required|integer',  
            created_for                   : 'required|integer', 
            closed_by                     : 'required|integer',               
            ticket_supportable_type       : `in:${application.ticket_support_type.join(',')}`,
            ticket_supportable_id         : 'required|integer',
            title                         : 'required|string|maxLength:255',
            description                   : 'required|string',
            attachment                    : 'required|string|chkUrlFormate',
            priority_level                : 'required|string', 
            closed_at                     : 'required|string', 
            is_closed                     : 'required|integer'            
        }

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        let save_ticket_support = {

            ticket_category_id             : formData.ticket_category_id,
            created_by                     : formData.created_by,
            created_for                    : formData.created_for,
            closed_by                      : formData.closed_by,
            ticket_number                  : (Math.random()*1e32).toString(36),
            ticket_supportable_type        : formData.ticket_supportable_type,
            ticket_supportable_id          : formData.ticket_supportable_id,
            title                          : formData.title,
            description                    : formData.description,     
            attachment                     : formData.attachment,  
            priority_level                 : formData.priority_level,           
            closed_at                      : formData.closed_at,
            is_closed                      : formData.is_closed            
        }

        new TicketSupport(save_ticket_support).save()
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

        TicketSupport.where(findBy,findFor).fetch({withRelated:['ticket_categories','product_details','created_by_user','created_for_user','closed_by_user']})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){         

        let ticket_support_id    = req.params.id;      

        let formData        = req.body;        
        let application     = Config('application');  

        let validationRules = {

            ticket_category_id            : 'required|integer', 
            created_by                    : 'required|integer',  
            created_for                   : 'required|integer', 
            closed_by                     : 'required|integer',               
            ticket_supportable_type       : `in:${application.ticket_support_type.join(',')}`,
            ticket_supportable_id         : 'required|integer',
            title                         : 'required|string|maxLength:255',
            description                   : 'required|string',
            attachment                    : 'required|string|chkUrlFormate',
            priority_level                : 'required|string', 
            closed_at                     : 'required|string|dateFormat:YYYY-MM-DD', 
            is_closed                     : 'required|integer'            
        }
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_ticket_support = {

            ticket_category_id             : formData.ticket_category_id,
            created_by                     : formData.created_by,
            created_for                    : formData.created_for,
            closed_by                      : formData.closed_by,            
            ticket_supportable_type        : formData.ticket_supportable_type,
            ticket_supportable_id          : formData.ticket_supportable_id,
            title                          : formData.title,
            description                    : formData.description,     
            attachment                     : formData.attachment,  
            priority_level                 : formData.priority_level,           
            closed_at                      : formData.closed_at,
            is_closed                      : formData.is_closed      
        }

        TicketSupport.where('id',ticket_support_id).save(update_ticket_support,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var ticket_support_id  = req.params.id;
        
        TicketSupport.where('id',ticket_support_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = TicketSupportController;