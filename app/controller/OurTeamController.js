const OurTeam  = Model('OurTeam');
const Validator   = Helper('validator');

const OurTeamController = {

    index:function(req, res,next){
        let is_active                   = _.toBoolean(req.query.is_active);       
        let has_pagination              = _.toBoolean(req.query.pagination);        
        let limit                       = _.toBoolean(req.query.limit)    ? _.toInteger(req.query.limit)  : 10;
        let page                        = _.toBoolean(req.query.page)     ? _.toInteger(req.query.page)   : 1;        

        let ourTeam                    = OurTeam.forge().orderBy('-id');

       
        if(is_active){
            ourTeam = ourTeam.where('is_active',1); 
        }
       
        if(has_pagination){
            let relation_params   = Object.assign({pageSize:limit,page:page});
            ourTeam              = ourTeam.fetchPage(relation_params);
        }else{
            ourTeam              = ourTeam.fetchAll();
        }

        ourTeam.then((our_team)=>{
            return res.status(200).json(res.fnSuccess(our_team));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store:async function(req,res,next){
        let formData    = req.body;

        var validation  = new Validator(formData,{
            name           :'required|string|maxLength:255|unique:our_teams',
            designation     :'required|string|maxLength:255',
            image           :'required|string|chkUrlFormate',
            is_active       :'required|integer',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        let save_team = {
            name        : formData.name, 
            designation  : formData.designation,
            image        : formData.image,
            is_active    : formData.is_active
        };

        new OurTeam(save_team).save().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        OurTeam.where(findBy,findFor).fetch()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        let formData            = req.body;  
        let our_team_id    = req.params.id;                      

        let validationRules = {

            name            :   'string|maxLength:255',
            designation     :   'string|maxLength:255',
            image           :   'string|chkUrlFormate',
            is_active       :   'integer',
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_team = {

            name        : formData.name, 
            designation  : formData.designation,
            image        : formData.image,
            is_active    : formData.is_active
            
        };

        OurTeam.where('id',our_team_id).save(update_team,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var our_team_id  = req.params.id;
        
        OurTeam.where('id',our_team_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = OurTeamController;