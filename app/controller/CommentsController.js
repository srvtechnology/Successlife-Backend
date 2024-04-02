const Comments      = Model('Comments');
const Validator     = Helper('validator');

const CommentsController = {

    index:function(req, res,next){

        let has_pagination          = _.toBoolean(req.query.pagination);
        let limit                   = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                    = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;    
        
        let fetchUser               = _.toBoolean(req.query.user) ? 'user' : {};
        let fetchPoductDetail       = _.toBoolean(req.query.product_details) ? 'product_details' : {};

        let comments                =  Comments.forge().orderBy('-id');       
        let relationShip            = [fetchUser,fetchPoductDetail];  

        if(has_pagination)
        {
            let  relation_params   = Object.assign({pageSize:limit,page:page},
                {withRelated:relationShip }
            );
            comments = comments.fetchPage(relation_params);
        }
        else
        {            
            comments = comments.fetchAll(Object.assign(
                {withRelated:relationShip})
            ); 
        }

        comments.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },
 
    store:async function(req,res,next){

        let formData        = req.body;                        
        let application     = Config('application');

        let validationRules = {

            comment            :  `required|string`,    
            commentable_id     :  'required|integer',                  
            commentable_type   :  `in:${application.commentable_type.join(',')}`,
            user_id            :  'required|integer|inDatabase:users,id'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_comments = _.pickBy({

            user_id           : formData.user_id,
            commentable_id    : formData.commentable_id,
            commentable_type  : formData.commentable_type,
            comment           : formData.comment

        },_.identity);

        new Comments(save_comments).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let fetchUser               = _.toBoolean(req.query.user) ? 'user' : {};
        let fetchPoductDetail       = _.toBoolean(req.query.product_details) ? 'product_details' : {};     

        let relationShip            = [fetchUser,fetchPoductDetail];  

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        Comments.where(findBy,findFor).fetch({withRelated:relationShip})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData        = req.body;                        
        let application     = Config('application');
        let comments_id     = req.params.id;   

        let validationRules = {

            comment            :  `required|string`,    
            commentable_id     :  'required|integer',                  
            commentable_type   :  `in:${application.commentable_type.join(',')}`,
            user_id            :  'required|integer|inDatabase:users,id'
        };      
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_comments = _.pickBy({

            user_id           : formData.user_id,
            commentable_id    : formData.commentable_id,
            commentable_type  : formData.commentable_type,
            comment           : formData.comment

        },_.identity);

        Comments.where('id',comments_id).save(update_comments,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var comments_id  = req.params.id;
        
        Comments.where('id',comments_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CommentsController;