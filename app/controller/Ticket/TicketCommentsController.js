const TicketComments    = Model('Ticket/TicketComments');
const Validator         = Helper('validator');

const TicketCommentsController = {

    index:function(req, res,next){

        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;  
        let user                = _.toBoolean(req.query.user)  ? 'user'                        : {};  
        let ticketSupport       = _.toBoolean(req.query.ticket_support)  ? 'ticket_support'    : {};  
        let commentMode         = req.query.comment_mode;

        let ticketComments  =  TicketComments.forge().orderBy('-id');    
       
        let relationShip = [user,ticketSupport];

        if(commentMode){
            ticketComments = ticketComments.where('comment_mode',commentMode);
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip   }
            );
            ticketComments = ticketComments.fetchPage(relation_params);
        }
        else
        {            
            ticketComments = ticketComments.fetchAll(Object.assign(
                    { withRelated:relationShip }
                )
            );
        }

        ticketComments.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){ 
        
        let formData        = req.body;                        

        let validationRules = {

            comment	            :  'required|string',
            comment_mode        :  'required|string',
            ticket_support_id   :  'required|integer',
            commenter_id        :  'required|integer'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_ticketComments = _.pickBy({
            
            comment             : formData.comment,
            comment_mode        : formData.comment_mode,
            ticket_support_id   : formData.ticket_support_id,
            commenter_id        : formData.commenter_id

        },_.identity);

        new TicketComments(save_ticketComments).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let user                = _.toBoolean(req.query.user)  ? 'user'                        : {};  
        let ticketSupport       = _.toBoolean(req.query.ticket_support)  ? 'ticket_support'    : {};  
       
        let relationShip = [user,ticketSupport];

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        TicketComments.where(findBy,findFor).fetch({withRelated:relationShip})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){
        
        let formData            = req.body;  
        let ticketCommentId        = req.params.id;                              

        let validationRules = {

            comment	            :  'required|string',
            comment_mode        :  'required|string',
            ticket_support_id   :  'required|integer',
            commenter_id        :  'required|integer'
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_wishlists = _.pickBy({

            comment             : formData.comment,
            comment_mode        : formData.comment_mode,
            ticket_support_id   : formData.ticket_support_id,
            commenter_id        : formData.commenter_id

        },_.identity);

        TicketComments.where('id',ticketCommentId).save(update_wishlists,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var ticketCommentId  = req.params.id;
        
        TicketComments.where('id',ticketCommentId).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = TicketCommentsController;