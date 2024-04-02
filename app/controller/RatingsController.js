const Ratings   = Model('Ratings');
const Validator   = Helper('validator');

const RatingsController = {

    index:function(req, res,next){

        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;       

        let ratings =  Ratings.forge().orderBy('-id');

        if(has_pagination)
        {
            let  relation_params   = Object.assign({pageSize:limit,page:page});
            ratings = ratings.fetchPage(relation_params);
        }
        else
        {            
            ratings = ratings.fetchAll();          
        }

        ratings.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){
        let formData        = req.body;                        
        
        let validationRules = { 

            title          :   'required|string',
            count          :   'required|integer',
            color_code     :   'required|string'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_ratings = {
            title        : formData.title,
            count        : formData.count,
            color_code   : formData.color_code
        }

        new Ratings(save_ratings).save()
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

        Ratings.where(findBy,findFor).fetch().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData             = req.body;
        let rating_id            = req.params.id;

        let validationRules  = {
            title          :   'required|string',
            count          :   'required|integer',
            color_code     :   'required|string'
        }      

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_ratings = {
            title        : formData.title,
            count        : formData.count,
            color_code   : formData.color_code
        }

        Ratings.where('id',rating_id).save(update_ratings,{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
 
    destroy:function(req,res,next){
        var rating_id  = req.params.id;
        
        Ratings.where('id',rating_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = RatingsController;