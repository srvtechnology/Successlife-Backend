const Payout      = Model('Payout');
const Validator   = Helper('validator');
const Wallets     = Model('Wallets/Wallets');
const moment = require('moment');
const walletHelper = Helper('wallet');
const mailNotification = Helper('mail-notification');

const PayoutController = {

    index:function(req, res,next){

        let relationShip = [];
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;        
        let wallet_id           = _.toBoolean(req.query.wallet_id)  ? _.toInteger(req.query.wallet_id)   :false;
        let wallet              = req.query.wallet || false;
        let string              = req.query.string || false;        

        let payout  =  Payout.forge().orderBy('-id');    
       
        if(wallet){
            let walletDetails = {'wallet':function(q){
                q.select('id','user_id');               
            }};
            relationShip.push(walletDetails);            
            relationShip.push('wallet.user.profile');
        }
        if(wallet_id){
            payout = payout.where('wallet_id',wallet_id).where('status','complete');   
        }        
        
        if(string){
            if(!_.toInteger(string)){
                payout = payout
                .query((qb)=>{
                    qb.innerJoin('users','users.id','user_id')
                    qb.innerJoin('profiles','profiles.user_id','users.id')
                    qb.whereRaw(`(users.user_name LIKE '%${string}%') OR (profiles.first_name LIKE '%${string}%' ) OR (profiles.last_name LIKE '%${string}%' )`)
                });                
            }
            else{            
                payout = payout.where('amount', 'like', `%${string}%`)
            }            
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip   }
            );
            payout = payout.fetchPage(relation_params);
        }
        else
        {            
            payout = payout.fetchAll(Object.assign(
                    { withRelated:relationShip }
                )
            );
        }

        payout.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){
        
    },

    show:function(req, res,next){

    },

    update:async function(req, res,next){ 
        let formData        = req.body;  
        let payoutId        = req.params.id;          
        let responseData = null;

        let validationRules = {

            wallet_id               :   'required|integer|inDatabase:wallets,id',
            user_id                 :   'required|integer|inDatabase:wallets,user_id'                        
        };                 
        
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if(await Wallets.where('user_id',formData.user_id).where('id',formData.wallet_id).count() == 0){
            return res.status(400).json(res.fnError(`User Id an Wallet Id didn't match.`));
        }         
        if(await Payout.where('wallet_id',formData.wallet_id).where('id',payoutId).count() == 0){
            return res.status(400).json(res.fnError(`Payout Id and Wallet Id didn't match`));
        }
            
        if(await Payout.where('wallet_id',formData.wallet_id).where('amount',formData.amount).count() == 0){
            return res.status(400).json(res.fnError(`Payout Amount didnt match from your wallet balance`));
        }
        let update_payout = _.pickBy({

            user_id             : formData.user_id,           
            comments            : formData.comments,
            status              : 'complete',
            approved_date       : `${moment().format('YYYY-MM-DD HH:mm:ss')}`,           

        },_.identity);

        Payout.where('id',payoutId).save(update_payout,{patch:true})         
        .then((response)=>{
            responseData = response;
            let walletTransactionObj = {
                transactionable_type:'payouts',
                transactionable_id:payoutId,
                description: `Payout details - ${formData.comments}`,
                amount:formData.amount,
                type:'debit',
                status:'complete',
                wallet_id:formData.wallet_id
            };

            walletHelper
                .setDataObject(walletTransactionObj)
                .exec()
                .then((resObj) => {                    
                    mailNotification.payoutReleased(payoutId);                      
                    return res.status(200).json(res.fnSuccess(responseData));                   
                    
                })
                .catch((errObj) => {
                    Payout.where('id',payoutId).save({"comments":"","status":"pending","approved_date":"'"},{patch:true})   
                    res.status(400).json(res.fnError(errObj));
                });
           
        })
        .catch((errors)=>{
            Payout.where('id',payoutId).save({"comments":"","status":"pending","approved_date":"'"},{patch:true}) 
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = PayoutController;