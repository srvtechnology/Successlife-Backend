const Permission  = Model('Permission');
const Validator   = Helper('validator');

const PermissionController = {

    index:function(req, res,next){

        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit)  ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)   ? _.toInteger(req.query.page)   : 1;

        if(has_pagination){
            var permission = Permission.fetchPage({pageSize:limit,page:page});
        }else{
            var permission = Permission.fetchAll();
        }
        
        permission.then((permissions)=>{
            return res.status(200).json(res.fnSuccess(permissions));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){

        let formData    = req.body;

        var validation  = new Validator(formData,{
            name        :'required|string|maxLength:255|unique:permissions',
            display_name:'required|string|maxLength:255',
            module      :'required|string|maxLength:255',
        })

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        new Permission(formData).save().then((permission)=>{
            return res.status(200).json(res.fnSuccess(permission));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        var permission_id  = req.params.id;

        Permission.where('id',permission_id).fetch().then((permission)=>{
            return res.status(200).json(res.fnSuccess(permission));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        let formData        = req.body;
        var permission_id   = req.params.id;

        var validation  = new Validator(formData,{
            display_name:'required|string|maxLength:255',
        })

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        Permission.where('id',permission_id).save(formData,{patch:true}).then((permission)=>{
            return res.status(200).json(res.fnSuccess(permission));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var permission_id     = req.params.id;
        Permission.where('id',permission_id).destroy().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}


module.exports = PermissionController;
