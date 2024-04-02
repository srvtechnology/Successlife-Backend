const TicketCategory = Model('Ticket/TicketCategory');
const Validator   = Helper('validator');

const TicketCategoryController = {

    index:function(req, res,next){

        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let is_active       = req.query.is_active;

        let ticketCategory      =  TicketCategory.forge().orderBy('-id');        

        if(is_active){
            ticketCategory      = ticketCategory.where('is_active',is_active);
        }       

        if(has_pagination)
        {
            let  ticketCategory   = Object.assign({pageSize:limit,page:page},{withRelated:['module']});
            resellerProduct = resellerProduct.fetchPage(ticketCategory);
        }
        else
        {            
            ticketCategory = ticketCategory.fetchAll(Object.assign({withRelated:['module']}));          
        }

        ticketCategory.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){

        let formData        = req.body;                        
        
        let validationRules = {

            name          :   'required|string|unique:ticket_categories',
            module_id     :   'required|integer',
            is_active     :   'required|integer'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_ticketCategory = {
            name        : formData.name,
            module_id   : formData.module_id,
            is_active   : formData.is_active
        }

        new TicketCategory(save_ticketCategory).save()
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

        TicketCategory.where(findBy,findFor).fetch({withRelated:['module']}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }, 

    update:async function(req, res,next){ 
        let formData         = req.body;
        let ticket_categories_id      = req.params.id;

        let validationRules  = {
            name          :   'required|string',
            module_id     :   'required|integer',
            is_active     :   'required|integer'
        }      

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_ticketCategory = {
            name        : formData.name,
            module_id   : formData.module_id,
            is_active   : formData.is_active
        }

        TicketCategory.where('id',ticket_categories_id).save(update_ticketCategory,{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var ticket_categories_id  = req.params.id;
        
        TicketCategory.where('id',ticket_categories_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}
 
module.exports = TicketCategoryController;