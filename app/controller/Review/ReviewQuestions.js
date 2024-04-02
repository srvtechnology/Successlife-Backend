const ReviewQuestion   = Model('Review/ReviewQuestions');
const Validator         = Helper('validator');

const ReviewQuestions = { 

    index:function(req, res,next){

        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;        

        let reviewQuestion  =  ReviewQuestion.forge().orderBy('-id');           

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    }                
            );
            reviewQuestion = reviewQuestion.fetchPage(relation_params);
        }
        else
        {            
            reviewQuestion = reviewQuestion.fetchAll();
        }

        reviewQuestion.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    }, 

    store:async function(req,res,next){
        
        let formData        = req.body;                        
        let application     = Config('application');

        let validationRules = {
            title	            :   'required|string',
            review_area         :   `in:${application.review_questions.join(',')}`            
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_review_questions = _.pickBy({
            
            title           : formData.title,
            review_area     : formData.review_area

        },_.identity);

        new ReviewQuestion(save_review_questions).save()
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

        ReviewQuestion.where(findBy,findFor).fetch()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 
        let formData                = req.body;  
        let reviewQuestionid        = req.params.id;                      
        let application             = Config('application');

        let validationRules = {

            title	            :   'required|string',
            review_area         :   `in:${application.review_questions.join(',')}` 
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_review_questions = _.pickBy({

            title           : formData.title,
            review_area     : formData.review_area

        },_.identity);

        ReviewQuestion.where('id',reviewQuestionid).save(update_review_questions,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let reviewQuestionid        = req.params.id;   
        ReviewQuestion.where('id',reviewQuestionid).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = ReviewQuestions;