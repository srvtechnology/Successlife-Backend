const ReviewDetail   = Model('Review/ReviewDetails');
const Validator      = Helper('validator');

const ReviewDetails = {

    index:function(req, res,next){
        
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)       : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)        : 1;  
        let fetchReview         = _.toBoolean(req.query.review)  ? 'review'                         :{}; 
        let fetchQuestion       = _.toBoolean(req.query.review_question) ? 'review_question'        :{}; 
        let fetchOption         = _.toBoolean(req.query.review_option) ? 'review_option'            :{}; 

        let reviewDetail        =  ReviewDetail.forge().orderBy('-id');    
        
        let relationShip        = [fetchReview,fetchQuestion,fetchOption];

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated:relationShip    }                
            );
            reviewDetail = reviewDetail.fetchPage(relation_params);
        }
        else
        {            
            reviewDetail = reviewDetail.fetchAll(Object.assign(
                    {withRelated:relationShip}
                )
            );     
        }

        reviewDetail.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){

        let formData        = req.body;  
        let validationRules = {

            review_id	            :   'required|integer',
            review_question_id	    :   'required|integer',
            review_option_id        :   'required|integer'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_review_detailss = _.pickBy({
            
            review_id               : formData.review_id,
            review_question_id      : formData.review_question_id,
            review_option_id        : formData.review_option_id

        },_.identity); 

        new ReviewDetail(save_review_detailss).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        
        let fetchReview         = _.toBoolean(req.query.review)  ? 'review'                         :{}; 
        let fetchQuestion       = _.toBoolean(req.query.review_question) ? 'review_question'        :{}; 
        let fetchOption         = _.toBoolean(req.query.review_option) ? 'review_option'            :{};

        let relationShip        = [fetchReview,fetchQuestion,fetchOption];

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        ReviewDetail.where(findBy,findFor).fetch({ withRelated:relationShip })
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData             = req.body;
        let reviews_detail_id           = req.params.id;

        let validationRules  = {
            review_id	            :   'required|integer',
            review_question_id	    :   'required|integer',
            review_option_id        :   'required|integer'
        }      

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_review_detail = {
            review_id               : formData.review_id,
            review_question_id      : formData.review_question_id,
            review_option_id        : formData.review_option_id
        }

        ReviewDetail.where('id',reviews_detail_id).save(update_review_detail,{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var reviews_detail_id  = req.params.id;
        
        ReviewDetail.where('id',reviews_detail_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = ReviewDetails;