const Validator             = Helper('validator');
const CourseTargetAnswer    = Model('Course/CourseTargetAnswer');


const CourseTargetAnswerController = {

    index:function(req, res,next){
        CourseTargetAnswer.forge().orderBy('-id').fetchAll().then((answers)=>{
            return res.status(200).json(res.fnSuccess(answers));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            answer            :'required|string',
            course_id         :'required|integer|inDatabase:courses,id',
            course_target_id  :'required|integer|inDatabase:course_targets,id',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let answer_data = _.pickBy({
            answer            :formData.answer,
            course_id         :formData.course_id,
            course_target_id  :formData.course_target_id
        },_.identity)

        new CourseTargetAnswer(answer_data).save().then((answer)=>{
            return res.status(200).json(res.fnSuccess(answer));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let answer_id = req.params.id;

        CourseTargetAnswer.where('id',answer_id).fetch().then((answer)=>{
            return res.status(200).json(res.fnSuccess(answer));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 

        let is_bulk         = _.toBoolean(req.query.bulk);
        let formData        = req.body;
        let answers_data    = [];
        let save_data       = [];
        let course_id       = formData.course_id;
        let questions       = formData.question;
        let answer_id       = req.params.id;
        let validationRules = {
            answer            :'required|string',
            course_id         :'integer|inDatabase:courses,id',
            course_target_id  :'integer|inDatabase:course_targets,id',
        }

        if(is_bulk){
            validationRules = {
                question                        :'required|array',
                course_id                       :'integer|inDatabase:courses,id',
                'question.*.course_target_id'   :'integer',
                'question.*.answers'            :'array',
                'question.*.answers.*.answer_id':'integer',
                'question.*.answers.*.answer'   :'string',
            }
        }

        let validation      = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        
        if(is_bulk){
            _.each(questions,(question)=>{
                let course_target_id = question.course_target_id;
                if(course_target_id){
                    _.each(question.answers,(v)=>{
                        if(v.answer){
                            let answerData = {
                                id                  :v.answer_id,
                                answer              :v.answer,
                                course_id           :course_id,
                                course_target_id    :course_target_id
                            };
                            answers_data.push(answerData);
                        }  
                    })
                }
            });

            new CourseTargetAnswer().createOrDelete({course_id:course_id},answers_data).then((data)=>{
                console.log(data)
                return res.status(200).json(res.fnSuccess(data));
            }).catch((errors)=>{
                console.log(errors)
                return res.status(400).json(res.fnError(errors));
            });

        }else{

            let answer_data = _.pickBy({
                answer            :formData.answer,
                course_id         :formData.course_id,
                course_target_id  :formData.course_target_id
            },_.identity)
    
            CourseTargetAnswer.where('id',answer_id).save(answer_data,{patch:true}).then((target)=>{
                return res.status(200).json(res.fnSuccess(target));
            }).catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
        }

    },

    destroy:function(req,res,next){
        let answer_id   = req.params.id;

        CourseTargetAnswer.where('id',answer_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

}

module.exports = CourseTargetAnswerController;