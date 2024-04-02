const User              = Model('User');
const PasswordReset     = Model('PasswordReset');
const Module            = Model('Module');
const Validator         = Helper('validator');
const bcrypt            = require('bcryptjs');
const PasswordResetMail = Mail('PasswordReset');
const AccountActivated  = Mail('AccountActivated');
const ChangePassword    = Mail('ChangePassword');

const AuthenticationController = {

    doAuthorization: async function(req,res,next){

        let formData    = req.body;

        var validation  = new Validator(formData,{
            user_name   :'required|string|email|maxLength:255',
            password    :'required|string|maxLength:255',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        User.where('user_name',escape(formData.user_name).trim()).fetch().then((user)=>{

            if(!user){
                return res.status(401).json(res.fnError('These credentials do not match our records.'));
            }

            if(user.get('token')){
                return res.status(401).json(res.fnError('Please verify your account.'));
            }

            if(user.get('is_active') == 0){
                return res.status(401).json(res.fnError('Please active your account.'));
            }

            if(user.get('is_block') == 1){
                return res.status(401).json(res.fnError('Your account is currently blocked. Please contact your administrator.'));
            }

            if(!bcrypt.compareSync(formData.password, user.get('password'))){
                return res.status(401).json(res.fnError('Password does not match.'));
            }

            let user_id = user.get('id');

            new User().getAuthorizeToken(user_id).then((data)=>{
                //console.log(data);
                return res.status(200).json(data);
            }).catch((e)=>{
                return res.status(400).json(res.fnError(errors));
            })
        })
        .catch((errors)=>{
           return res.status(400).json(res.fnError(errors));
        });
    },

    doSocialAuthorization: async function(req,res,next){

        let formData    = req.body;

        var validation  = new Validator(formData,{
            user_name       :'required|string|email'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        await User.where('user_name',formData.user_name).fetch().then((user)=>{
            if(!user){
                return res.status(401).json(res.fnError('These credentials do not match our records.'));
            }

            if(user.get('is_active') == 0){
                return res.status(401).json(res.fnError('Please active your account.'));
            }

            if(user.get('is_block') == 1){
                return res.status(401).json(res.fnError('Your account is currently blocked. Please contact your administrator.'));
            }

            let user_id = user.get('id');

            new User().getAuthorizeToken(user_id).then((data)=>{
                return res.status(200).json(data);
            }).catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            })

        }).catch((errors)=>{
            return res.status(400).json(errors);
        })
    },

    passwordResetToken : async function(req,res,next){

        let formData    = req.body;
        let validation  = new Validator(formData,{
            user_name  :'required|string|email|maxLength:250',
            email_link :'required|url',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let user_data;
        User.where('user_name',formData.user_name).fetch({'withRelated':'profile'}).then((user)=> {
            if(!user){
                return res.status(401).json(res.fnError('This email id does not exists in our record.'));
            }
            user_data = user;
            return PasswordReset.where('user_name',user.get('user_name')).destroy({require:false});
        })
        .then((password_reset)=>{

            let password_reset_data = {
                user_name : user_data.get('user_name'),
                token : encrypt({
                    user_name  : user_data.get('user_name'),
                    expired_on : new Date().addDays(5).toTime(),
                }),
                created_at : new Date().format('mysql')
            }

            return new PasswordReset(password_reset_data).save();
        })
        .then((password_reset)=>{
            PasswordResetMail(password_reset,user_data.toJSON(),formData.email_link).then((response)=>{
                dd(response)
                return res.status(200).json(res.fnSuccess(_.omit(password_reset.toJSON(),'id')));
            }).catch((errors) =>{
                return res.status(401).json(res.fnError(errors,'Something wrong please try again after some time.'));
            })

        })
        .catch((errors)=> {
            return res.status(400).json(res.fnError(errors));
        })
    },

    passwordReset: async function(req,res,next){

        let formData    = req.body;
        let validation  = new Validator(formData,{
            password   :'required|string|minLength:6|maxLength:250',
            token      :'required|string',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let token = decrypt(formData.token);

        if(!token){
            return res.status(401).json(res.fnError('This token is invalid.'));
        }

        if(token.expired_on <= new Date().getTime()){
            return res.status(401).json(res.fnError('This token has been expired.'));
        }

        PasswordReset.where('user_name',token.user_name).fetch().then((password_reset)=> {

            if(!password_reset){
                return res.status(401).json(res.fnError('The requested token is invalid or expired.'));
            }

            let save_data = {
                password : bcrypt.hashSync(formData.password,10)
            }

            User.where('user_name',token.user_name).save(save_data,{patch:true}).then((user)=>{
                return PasswordReset.where('user_name',token.user_name).destroy({require:true});
            })
            .then((reset_password)=>{
                return res.status(200).json(res.fnSuccess('Password updated successfully.'));
            })
            .catch((errors)=>{
                return res.status(401).json(res.fnError(errors));
            });
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    profilePassowrdReset : async function(req,res,next){
        let formData    = req.body;
        let validation  = new Validator(formData,{
            user_name      :'required|string|email|maxLength:250',
            old_password   :'required|string|maxLength:250',
            new_password   :'required|string|minLength:6|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        User.where('user_name',formData.user_name).fetch({'withRelated':'profile'}).then((user)=>{
            if(!user){
                return res.status(401).json(res.fnError('These email address does not exists in our records.'));
            }
            if(!bcrypt.compareSync(formData.old_password,user.get('password'))){
                return res.status(401).json(res.fnError('Old passowrd does not match.'));
            }

            let save_data = {
                password : bcrypt.hashSync(formData.new_password,10)
            }

            user.save(save_data,{patch:true}).then((user)=>{
                ChangePassword(user.toJSON());
                return res.status(200).json(res.fnSuccess(user));
            }).catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    forcePasswordReset : async function(req,res,next){

        let formData    = req.body;
        let validation  = new Validator(formData,{
            user_name  :'required|string|email|maxLength:250|inDatabase:users',
            password   :'required|string|minLength:6|maxLength:250',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_data = {
            password : bcrypt.hashSync(formData.password,10),
            is_active:1
        }

        User.where('user_name',formData.user_name).save(save_data,{patch:true}).then((user)=>{
            return res.status(200).json(res.fnSuccess(user));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    tokenVerify : async function(req,res,next){

        let sendToken   = req.params.token;
        let token       = decrypt(sendToken);
        let responseData;

        if(token.expired_on <= new Date().getTime()){
            return res.status(401).json(res.fnError('This token has been expired.'));
        }

        User.where('user_name',token.user_name).fetch().then((user)=> {
            if(!user){
                return res.status(401).json(res.fnError('The requested token is invalid or expired.'));
            }

            if(sendToken !== user.get('token')){
                return res.status(401).json(res.fnError('This token is invalid.'));
            }

            let user_data = {
                token       : null,
                is_active   : 1,
                is_block    : 0,
                activated_at: new Date().format('mysql')
            }

            user.save(user_data,{patch:true}).then((user_response)=>{

                User
                .where('id',user_response.toJSON().id)
                .where('is_active',1)
                .fetch({'withRelated':'roles'})
                .then((user_response_with_role)=>{
                    AccountActivated(user_response_with_role.toJSON());
                    return res.status(200).json(res.fnSuccess(user_response_with_role));
                })
                .catch((err)=>{
                    return res.status(400).json(res.fnError(errors));
                })
            })
            .catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });

        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        })
    },

    getModuleWithPermissions : function(req,res,next){
        Module.forge().orderBy('-id').fetchAll({withRelated:'permissions'}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    getPermissions:function(req,res,next){

        let user_id = req.params.user_id;

        new User().getPermissions(user_id).pluck('permissions.name').then((permissions)=>{
            return res.status(200).json(res.fnSuccess(permissions));
        }).catch(function(errors){
            return res.status(400).json(res.fnError(errors));
        })
    },

    getRoles:function(req,res,next){
        let user_id = req.params.user_id;

        new User().getRoles(user_id).pluck('roles.name').then((roles)=>{
            return res.status(200).json(res.fnSuccess(roles));
        }).catch(function(errors){
            return res.status(400).json(res.fnError(errors));
        })
    },

    hasPermission:function(req,res,next){

        let user_id         = req.params.user_id;
        let permissions     = _.isArray(req.query.name) ? req.query.name : [req.query.name];

        new User().getPermissions(user_id).pluck('permissions.name').then(function(permissions_array){

            var permssion_status = [];

            permissions.forEach(function(name){
                permssion_status.push({
                    name    : name,
                    status  :(permissions_array.indexOf(name) >= 0)
                })
            });

            var data = {
                has_permission  : !!permissions_array.length,
                permissions     : permssion_status
            }

            return res.status(200).json(res.fnSuccess(data));
        })
        .catch(function(errors){
            return res.status(400).json(res.fnError(errors));
        })
    },

    hasRole:function(req,res,next){
        let user_id   = req.params.user_id;
        let roles     = _.isArray(req.query.name) ? req.query.name : [req.query.name];

        new User().getRoles(user_id).pluck('roles.name').then(function(roles_array){
            var role_status = [];
            roles.forEach(function(name){
                role_status.push({
                    name    : name,
                    status  :(roles_array.indexOf(name) >= 0)
                })
            });
            var data = {
                has_role  : !!roles_array.length,
                roles     : role_status
            }
            return res.status(200).json(res.fnSuccess(data));
        })
        .catch(function(errors){
            return res.status(400).json(res.fnError(errors));
        })
    }
}


module.exports = AuthenticationController;