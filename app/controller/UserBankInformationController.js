const UserBankInformation   = Model('UserBankInformation');
const Validator             = Helper('validator');

const UserBankInformationController = {

    index:function(req, res,next){

        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let user_id             = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let string              = req.query.string || false;

        let userBankInformation    =  UserBankInformation.forge().orderBy('-id');           
        
        if(string){
            userBankInformation = userBankInformation.where(function () {
                this.where('bank_name', 'like', `%${string}%`)
                    .orWhere('branch_name', 'like', `%${string}%`)                            
                    .orWhere('branch_name', 'like', `%${string}%`)                            
                    .orWhere('branch_address', 'like', `%${string}%`)                            
                    .orWhere('branch_code', 'like', `%${string}%`)                            
                    .orWhere('account_no', 'like', `%${string}%`)                            
                    .orWhere('account_holder_name', 'like', `%${string}%`)                            
                    .orWhere('wire_transfer_code', 'like', `%${string}%`)                            
            })
        }

        if(user_id)
        {   
            userBankInformation = userBankInformation.where('user_id',user_id)
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    }               
            );
            userBankInformation = userBankInformation.fetchPage(relation_params,{withRelated:['user','user.profile']});
        }
        else
        {            
            userBankInformation = userBankInformation.fetchAll({withRelated:['user','user.profile']});
        }


        userBankInformation
        .then((bank_information)=>{
            return res.status(200).json(res.fnSuccess(bank_information));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
 
    store:async function(req,res,next){

        let formData        = req.body;                        
        let application     = Config('application');

        let validationRules = {

            user_id             :   'required|integer|inDatabase:users,id',
            bank_name           :   'required|string',
            branch_name         :   'required|string',
            branch_address      :   'required|string',
            branch_code         :   'required|string|unique:user_bank_informations',
            account_no          :   'required|numeric|unique:user_bank_informations',
            account_holder_name :   'required|string',
            account_type        :   `required|in:${application.account_type.join(',')}`,
            wire_transfer_code  :   'required|string|unique:user_bank_informations'            
            
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_bank_details = {
            user_id             : formData.user_id,
            bank_name           : formData.bank_name,
            branch_name         : formData.branch_name,
            branch_address      : formData.branch_address,
            branch_code         : formData.branch_code,
            account_no          : formData.account_no,
            account_holder_name : formData.account_holder_name,
            account_type        : formData.account_type,
            wire_transfer_code  : formData.wire_transfer_code,
            is_default          : formData.is_default
        };

        new UserBankInformation(save_bank_details).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let user_bank_id = req.params.id;

        UserBankInformation.where('id',user_bank_id).fetch().then((details)=>{
            return res.status(200).json(res.fnSuccess(details));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 

        let user_bank_id = req.params.id;
        let application     = Config('application');

        let formData        = req.body;

        let validationRule  = {
            user_id             :   'required|integer|inDatabase:users,id',
            bank_name           :   'required|string',
            branch_name         :   'required|string',
            branch_address      :   'required|string',
            branch_code         :   'required|string',
            account_no          :   'required|numeric',
            account_holder_name :   'required|string',
            account_type        :   `required|in:${application.account_type.join(',')}`,
            wire_transfer_code  :   'required|string'           
        }
        
        let validation      = new Validator(formData,validationRule);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_bank_details = {
            user_id             : formData.user_id,
            bank_name           : formData.bank_name,
            branch_name         : formData.branch_name,
            branch_address      : formData.branch_address,
            branch_code         : formData.branch_code,
            account_no          : formData.account_no,
            account_holder_name : formData.account_holder_name,
            account_type        : formData.account_type,
            wire_transfer_code  : formData.wire_transfer_code,
            is_default          : formData.is_default,
        };

        
        UserBankInformation.where('id',user_bank_id)
        .save(update_bank_details,{patch:true})
        .then((details)=>{
            return res.status(200).json(res.fnSuccess(details));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){

        let user_bank_id = req.params.id;

        UserBankInformation
        .where('id',user_bank_id)
        .destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = UserBankInformationController;