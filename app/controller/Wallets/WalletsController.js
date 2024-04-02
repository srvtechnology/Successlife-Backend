const Wallets     = Model('Wallets/Wallets');
const Validator   = Helper('validator');

const WalletsController = {

    index:function(req, res,next){

        let relationShip        = [];
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;   
        let user_id             = _.toBoolean(req.query.user_id)  ? _.toInteger(req.query.user_id)  : 0     
        let has_transaction     = _.toBoolean(req.query.wallet_transaction);
        let has_user            = _.toBoolean(req.query.user);

        let wallets  =  Wallets.forge().orderBy('-id');    

        if(has_transaction){
            relationShip.push('wallet_transactions');
        }
        if(has_user){
            relationShip.push('user');
        }

        if(user_id){
            wallets = wallets.where('user_id',user_id);
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip   }
            );
            wallets = wallets.fetchPage(relation_params);
        }
        else
        {            
            wallets = wallets.fetchAll(Object.assign(
                    { withRelated: relationShip }
                )
            );
        }

        wallets.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){
        let formData        = req.body;                                

        let validationRules = {

            user_id       :   'required|integer|unique:wallets',
            amount        :   'required|decimal'           
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_wishlists = _.pickBy({

            user_id           : formData.user_id,
            amount            : formData.amount

        },_.identity);

        new Wallets(save_wishlists).save()
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

        let user_id = _.toBoolean(req.query.search_by) ? req.query.search_by : false;
        
        let wallets = Wallets
        if(user_id){
           
            wallets = wallets.where(user_id,findFor)
        }
        else {                       
            wallets = wallets.where(findBy,findFor)
        }
        
        wallets = wallets
        .fetch({withRelated:'user'})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }, 

    update:async function(req, res,next){ 
        let formData            = req.body;  
        let wallet_id  = req.params.id;

        let validationRules = {

            user_id       :   'required|integer',
            amount        :   'required|decimal' 
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_wallet = _.pickBy({

            user_id           : formData.user_id,
            amount            : formData.amount

        },_.identity);

        Wallets.where('id',wallet_id).save(update_wallet,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
 
    destroy:function(req,res,next){
        let wallet_id  = req.params.id;
        
        Wallets.where('id',wallet_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = WalletsController;