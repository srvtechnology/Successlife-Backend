const PaymentCategory  = Model('PaymentCategory');
const Validator   = Helper('validator');

const PaymentCategoryController = {

    index:function(req, res,next){
        let is_active                   = _.toBoolean(req.query.is_active);        
        let has_pagination              = _.toBoolean(req.query.pagination);        
        let limit                       = _.toBoolean(req.query.limit)    ? _.toInteger(req.query.limit)  : 10;
        let page                        = _.toBoolean(req.query.page)     ? _.toInteger(req.query.page)   : 1;        

        let paymentCategory             = PaymentCategory.forge().where('id','!=',1).orderBy('-id');

        if(is_active){
            paymentCategory = paymentCategory.where('is_active',req.query.is_active); 
        }        

        if(has_pagination){
            let relation_params   = Object.assign({pageSize:limit,page:page});
            paymentCategory              = paymentCategory.fetchPage(relation_params);
        }else{
            paymentCategory              = paymentCategory.fetchAll();
        }

        paymentCategory.then((paymentCategories)=>{
            return res.status(200).json(res.fnSuccess(paymentCategories));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store:async function(req,res,next){
        let formData    = req.body;

        var validation  = new Validator(formData,{
            title        :'required|string|maxLength:250|unique:payment_categories',
            description  :'required|string',
            is_active    :'required|boolean'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        let save_payment_category = {
            title       : formData.title,            
            description : formData.description,            
            is_active   : formData.is_active,      
        };

        new PaymentCategory(save_payment_category).save().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        PaymentCategory.where(findBy,findFor).fetch().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData         = req.body;
        let paymnet_category_id      = req.params.id;

        let validationRules  = {
            title        :'string|maxLength:250',
            description  :'string',
            is_active    :'boolean'
        }

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_payment_category = {
            title       : formData.title,            
            description : formData.description,            
            is_active   : formData.is_active,
        };

        PaymentCategory.where('id',paymnet_category_id).save(update_payment_category,{patch:true}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let paymnet_category_id      = req.params.id;

        PaymentCategory.where('id',paymnet_category_id).destroy({required:false})
        .then((parent_category)=>{
            return res.status(200).json(res.fnSuccess(parent_category));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = PaymentCategoryController;