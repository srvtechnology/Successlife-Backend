const WalletTransaction   = Model('Wallets/WalletTransactions');
const Validator            = Helper('validator');

const WalletTransactions = {

    index:function(req, res,next){
        
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)               : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)                : 1;        
        let fetchWalletDetails  = _.toBoolean(req.query.wallet) ?  'wallet'                                 : {};
        let fetchProductDetails = _.toBoolean(req.query.product_detail) ?  'details'                : {};
        let fetchProductUserDetails = _.toBoolean(req.query.product_detail_user) ?  'details.user'  : {};

        let status              = req.query.status;
        let walletId            = req.query.wallet_id;
       
        let walletTransaction  =  WalletTransaction.forge().orderBy('-id');   

        if(status){
            walletTransaction = walletTransaction.where('status',status);
        }

        if(walletId){
            walletTransaction = walletTransaction.where('wallet_id',walletId);
        }
        let relationShip = [fetchWalletDetails,fetchProductDetails,fetchProductUserDetails];

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip  }
            );
            walletTransaction = walletTransaction.fetchPage(relation_params);
        }
        else
        {            
            walletTransaction = walletTransaction.fetchAll(Object.assign(
                    { withRelated: relationShip }
                )
            );
        }
 
        walletTransaction.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){
        let formData        = req.body;                                
        let application     = Config('application');

        let validationRules = {

            wallet_id               :   'required|integer',
            transactionable_id      :   'required|integer',
            description             :   'required|string',
            debit                   :   'required|decimal',
            credit                  :   'required|decimal',
            transactionable_type    :   `in:${application.wallet_transactions_type.join(',')}`,
            status                  :   'required|string',
        }; 

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_wallet_transactions = _.pickBy({

            wallet_id               :   formData.wallet_id,
            transactionable_id      :   formData.transactionable_id,
            description             :   formData.description,
            debit                   :   formData.debit,
            credit                  :   formData.credit,
            transactionable_type    :   formData.transactionable_type,
            status                  :   formData.status

        },_.identity);

        new WalletTransaction(save_wallet_transactions).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
       
        let relationShip = ['wallet','details'];

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        WalletTransaction.where(findBy,findFor).fetch({withRelated:relationShip})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 

        let formData                = req.body;  
        let walletTransaction_id    = req.params.id;                      
        let application             = Config('application');

        let validationRules = {

            wallet_id               :   'required|integer',
            transactionable_id      :   'required|integer',
            description             :   'required|string',
            debit                   :   'required|decimal',
            credit                  :   'required|decimal',
            transactionable_type    :   `in:${application.wallet_transactions_type.join(',')}`,
            status                  :   'required|string',
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_wallet_transactions = _.pickBy({

            wallet_id               :   formData.wallet_id,
            transactionable_id      :   formData.transactionable_id,
            description             :   formData.description,
            debit                   :   formData.debit,
            credit                  :   formData.credit,
            transactionable_type    :   formData.transactionable_type,
            status                  :   formData.status

        },_.identity);

        WalletTransaction.where('id',walletTransaction_id).save(update_wallet_transactions,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var walletTransaction_id  = req.params.id;
        
        WalletTransaction.where('id',walletTransaction_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = WalletTransactions;