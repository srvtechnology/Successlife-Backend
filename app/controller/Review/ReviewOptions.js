const ReviewOption   = Model('Review/ReviewOptions');
const Validator   = Helper('validator');

const ReviewOptions = {

    index:function(req, res,next){

        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;        
        let fetchReviewQuestion = _.toBoolean(req.query.reviewQuestions)  ? 'review_questions' : {};        

        let reviewOption  =  ReviewOption.forge().orderBy('-id');           

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: fetchReviewQuestion   }                
            );
            reviewOption = reviewOption.fetchPage(relation_params);
        }
        else
        {            
            reviewOption = reviewOption.fetchAll(Object.assign(
                    { withRelated:fetchReviewQuestion }
                )
            );
        }

        reviewOption.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){

        let formData        = req.body;  
        let validationRules = {

            title	            :   'required|string',
            review_question_id  :   'required|integer',
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_review_options = _.pickBy({
            
            title               : formData.title,
            review_question_id  : formData.review_question_id

        },_.identity); 

        new ReviewOption(save_review_options).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let fetchReviewQuestion = _.toBoolean(req.query.reviewQuestions)  ? 'review_questions' : {};

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        ReviewOption.where(findBy,findFor).fetch({ withRelated:fetchReviewQuestion })
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 

        let formData                = req.body;  
        let reviewOptionid          = req.params.id;                             

        let validationRules = {

            title	            :   'required|string',
            review_question_id  :   'required|integer',
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_review_options = _.pickBy({

            title               : formData.title,
            review_question_id  : formData.review_question_id

        },_.identity);

        ReviewOption.where('id',reviewOptionid).save(update_review_options,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){

        let reviewDeleteid        = req.params.id;   
        ReviewOption.where('id',reviewDeleteid).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });

    },
}

module.exports = ReviewOptions;