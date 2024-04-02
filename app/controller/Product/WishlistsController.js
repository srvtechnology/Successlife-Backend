const Wishlists   = Model('Product/Wishlists');
const Validator   = Helper('validator');

const WishlistsController = {

    index:function(req, res,next){

        let relationShip = [];
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let fetchUserDetails    = _.toBoolean(req.query.user_details) ?  'user'                : false;
        let fetchProduct_details= _.toBoolean(req.query.product_details) ?  'product_details'  : false;
        let fetchProductUser    = _.toBoolean(req.query.product_user) ?  'product_details.user': false;
        let user_id             = _.toInteger(req.query.user_id);    
        let fetchProductImages  = _.toBoolean(req.query.images);    
        let fetch_price          = _.toBoolean(req.query.fetch_price);
        
        let wishlists  =  Wishlists.forge().orderBy('-id');    

        if(fetchUserDetails){
            relationShip.push(fetchUserDetails)
        }
        if(fetchProduct_details){

            relationShip.push(fetchProduct_details)
            if(fetchProductUser){
                relationShip.push(fetchProductUser)
            }
            if(fetchProductImages){
                relationShip.push('product_details.images')
            }
            if(fetch_price){
                let priceDetails = {'product_details.pricable':function(q){
                    q.select('pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity');
                    q.where('pricable_type','courses')
                }};
                relationShip.push(priceDetails); 
                let paymentCategory = {'product_details.pricable.payment_category':function(q){
                    q.select('id','title','description');
                    q.where('is_active',1)
                }};     
                relationShip.push(paymentCategory);                    
                let payementType = {'product_details.pricable.payment_type':function(q){
                    q.select('id','title');
                    q.where('is_active',1)
                }};            
                relationShip.push(payementType);        
            }
        }    

        if(user_id){

            wishlists = wishlists.where('user_id',user_id);
            
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip   }
            );
            wishlists = wishlists.fetchPage(relation_params);
        }
        else
        {            
            wishlists = wishlists.fetchAll(Object.assign(
                    { withRelated:relationShip }
                )
            );
        }

        wishlists.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){
        let formData        = req.body;                        
        let application     = Config('application');

        let validationRules = {

            user_id             :   'required|integer',
            wishlistable_type   :   `required|in:${application.wishlistable_type.join(',')}`,
            wishlistable_id     :   'required|integer'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_wishlists = _.pickBy({
            user_id           : formData.user_id,
            wishlistable_type : formData.wishlistable_type,
            wishlistable_id   : formData.wishlistable_id
        },_.identity);

        new Wishlists(save_wishlists).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){ 

        let fetchUserDetails    = _.toBoolean(req.query.user_details) ?  'user'                : {};
        let fetchProduct_details= _.toBoolean(req.query.product_details) ?  'product_details'  : {};
        let fetchProductUser    = _.toBoolean(req.query.product_user) ?  'product_details.user': {};         

        let relationShip = [fetchUserDetails,fetchProduct_details,fetchProductUser];

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        Wishlists.where(findBy,findFor).fetch({withRelated:relationShip})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData            = req.body;  
        let wishlists_id        = req.params.id;                      
        let application         = Config('application');

        let validationRules = {

            user_id             :   'required|integer',
            wishlistable_type   :   `required|in:${application.wishlistable_type.join(',')}`,
            wishlistable_id     :   'required|integer'
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_wishlists = _.pickBy({

            user_id           : formData.user_id,
            wishlistable_type : formData.wishlistable_type,
            wishlistable_id   : formData.wishlistable_id

        },_.identity);

        Wishlists.where('id',wishlists_id).save(update_wishlists,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var wishlists_id  = req.params.id;
        
        Wishlists.where('id',wishlists_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = WishlistsController;