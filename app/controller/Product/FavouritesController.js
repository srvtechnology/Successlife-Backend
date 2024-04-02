const Favourites   = Model('Product/Favourites');
const Validator    = Helper('validator');

const FavouritesController = {
 
    index:function(req, res,next){

        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        
        let favourites         =  Favourites.forge().orderBy('-id');

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {pageSize:limit,page:page},
                {withRelated:['user','product_details']}
            );
            favourites = favourites.fetchPage(relation_params);
        }
        else
        {            
            favourites = favourites.fetchAll(Object.assign({withRelated:['user','product_details']}));
        }

        favourites.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){

        let formData        = req.body;  
        let application     = Config('application');                            
        
        let validationRules = {

            user_id                 : 'required|integer',            
            favouriteable_type      : `in:${application.favourites_type.join(',')}`,
            favouriteable_id        : 'required|integer',            
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_favourites = {

            user_id                 : formData.user_id,
            favouriteable_type      : formData.favouriteable_type,
            favouriteable_id        : formData.favouriteable_id
        }

        new Favourites(save_favourites).save()
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

        Favourites.where(findBy,findFor).fetch({withRelated:['user','product_details']}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){  
        let application     = Config('application');        
        let formData        = req.body;
        let favourites_id   = req.params.id;

        let validationRules  = {
            user_id                 : 'required|integer',            
            favouriteable_type      : `in:${application.favourites_type.join(',')}`,
            favouriteable_id        : 'required|integer',
        }      

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_reseller_product = {
            user_id                 : formData.user_id,
            favouriteable_type      : formData.favouriteable_type,
            favouriteable_id        : formData.favouriteable_id
        }

        Favourites.where('id',favourites_id).save(save_reseller_product,{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var favourites_id  = req.params.id;
        
        Favourites.where('id',favourites_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = FavouritesController;