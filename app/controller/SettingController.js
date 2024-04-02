const Setting       = Model('Setting');
const Validator     = Helper('validator');
const fs = require('fs');

const SettingController = {

    index:function(req, res,next){       
        

        Setting.fetchAll().then((settingDetails)=>{
            return res.status(200).json(res.fnSuccess(settingDetails));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store:async function(req,res,next){
        let formData                = req.body;       

        if (!_.isArray(formData)) {
            return res.status(400).json(res.fnError(`Data must be in array!.`));
        }

        let validation = new Validator({
            items: formData           
        },
            {
                'items'                 : 'required|array',
                'items.*.access_key'    : 'required|string',
                'items.*.value'         : 'required|string'
            }
        );
       
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }       
        
        Setting.where(1,1).destroy({required:false});
        new Setting().batchInsert(formData)        
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(formData));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
        
    },

    show:function(req, res,next){       

        Setting.where('access_key',req.params.id).fetch()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){         
        
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = SettingController;