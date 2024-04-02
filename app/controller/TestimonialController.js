const Testimonial   = Model('Testimonial');
const Validator     = Helper('validator');

const TestimonialController = {

    index:function(req, res,next){

        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;              
        let is_active           = _.toBoolean(req.query.is_active);
        let string              = req.query.string || false;

        let testimonial  =  Testimonial.forge().orderBy('-id');           

        if(is_active){           
            testimonial = testimonial.where('is_active',is_active);
        }
        if(string){
            testimonial = testimonial.where(function () {
                this.where('name', 'like', `%${string}%`)
                    .orWhere('education', 'like', `%${string}%`)      
                    .orWhere('description', 'like', `%${string}%`)                        
            })
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    }                
            );
            testimonial = testimonial.fetchPage(relation_params);
        }
        else
        {            
            testimonial = testimonial.fetchAll();
        }

        testimonial.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){ 
        let formData        = req.body;                                

        let validationRules = {
            name	            :   'required|string',
            education	        :   'required|string',
            avatar              :   'required|string|chkUrlFormate',
            description         :   'required|string',
            is_active           :   'required'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_testimonial = {
            
            name            : formData.name,
            education       : formData.education,
            avatar          : formData.avatar,
            description     : formData.description,
            is_active       : formData.is_active

        };

        new Testimonial(save_testimonial).save()
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

        Testimonial.where(findBy,findFor).fetch()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 

        let formData                = req.body;  
        let testimonial_id          = req.params.id;                             

        let validationRules = {

            name	            :   'required|string',
            education	        :   'required|string',
            avatar              :   'required|string|chkUrlFormate',
            description         :   'required|string',
            is_active           :   'required'
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_testimonial = {

            name            : formData.name,
            education       : formData.education,
            avatar          : formData.avatar,
            description     : formData.description,
            is_active       : formData.is_active

        };

        Testimonial.where('id',testimonial_id).save(update_testimonial,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let testimonial_id        = req.params.id;   
        Testimonial.where('id',testimonial_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = TestimonialController;