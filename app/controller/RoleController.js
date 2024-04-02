const Role        = Model('Role');
const Validator   = Helper('validator');

const RoleController = {

    index:function(req, res,next){
        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit)    ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)     ? _.toInteger(req.query.page)   : 1;
        let string          = req.query.string || false;

        let roles           = Role.forge().orderBy('-id');
        
        if(string){
            roles = roles.where(function () {
                this.where('name', 'like', `%${string}%`)
                    .orWhere('display_name', 'like', `%${string}%`)                    
            })
        }
        if(has_pagination){
            roles = roles.fetchPage({pageSize:limit,page:page});
        }else{
            roles = roles.fetchAll();
        }

        roles.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){

        let formData    = req.body;

        var validation  = new Validator(formData,{
            name        :'required|string|maxLength:255|unique:roles',
            display_name:'required|string|maxLength:255',
            permissions :'required|array'
        })

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let role_data = {
            display_name : formData.display_name,
            name         : formData.name
        }

        new Role(role_data).save().then((role)=>{
            role.permissions().attach(formData.permissions);
            return role;
        })
        .then((role)=>{
            return Role.where('id',role.get('id')).fetch({withRelated:'permissions'});
        })
        .then((role_permissions)=>{
            return res.status(200).json(res.fnSuccess(role_permissions));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        var role_id  = req.params.id;

        Role.where('id',role_id).fetch({withRelated:'permissions'}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(200).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        let formData  = req.body;
        var role_id   = req.params.id;

        var validation  = new Validator(formData,{
            display_name:'required|string|maxLength:255',
            permissions :'required|array'
        })

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_data = {
            display_name : formData.display_name
        }

        Role.where('id',role_id).save(save_data,{patch:true}).then((role)=>{
            return  role.where('id',role_id).fetch();
        })
        .then((role)=>{
            if(formData.permissions){
                role.permissions().detach();
                role.permissions().attach(formData.permissions);
            }
            return role.fetch({withRelated:'permissions'});
        })
        .then((role_permissions)=>{
            return res.status(200).json(res.fnSuccess(role_permissions));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){

        var role_id     = req.params.id;

        Role.where('id',role_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }
}


module.exports = RoleController;
