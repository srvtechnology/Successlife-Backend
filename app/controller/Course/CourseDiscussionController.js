const Validator         = Helper('validator');
const CourseDiscussion  = Model('Course/CourseDiscussion');
const notificationAlert = Helper('notification-alert');
const Profile  = Model('Profile');

const CourseDiscussionController = {

    index:function(req, res,next){

        let orderbyColumn       = ['id'];
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;        
        let user_id             = _.toInteger(req.query.user_id);                
        let course_id           = _.toInteger(req.query.course_id);  
        let order_by            = _.toBoolean(req.query.order_by) ? req.query.order_by : '-id';
        let string              = _.toBoolean(req.query.string) ? req.query.string : false;        
        let responseCount       = _.toBoolean(req.query.response_count);

        let courseDiscussion  =  CourseDiscussion.forge();   
        
        if(user_id){
            courseDiscussion = courseDiscussion.where('course_discussions.user_id',user_id);            
        }
        if(course_id){
            courseDiscussion = courseDiscussion.where('course_discussions.course_id',course_id);            
        } 
        if(order_by && _.contain(orderbyColumn,_.lTrim(order_by,['-','+'])) ){
            courseDiscussion =  courseDiscussion.orderBy(order_by);
        }

        if(responseCount){                    
            courseDiscussion = courseDiscussion           
            .query(function(qb){ 
                qb.select('course_discussions.*')       
                qb.count('course_discussions_response.course_discussions_id as response_count')                
                qb.leftJoin('course_discussions_response', 'course_discussions_response.course_discussions_id', 'course_discussions.id')
                qb.groupBy('course_discussions.id')      
            })            
        }
        if(string){
            courseDiscussion.where(function () {
                this.where('title', 'like', `%${string}%`)                
            })
        }
        let userData =  {'user':function(q){
            q.select('id','avatar')
        },'user.profile':function(q){
            q.select('id','user_id','first_name','middle_name','last_name')
        }};
        
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },               
                {   withRelated:[userData]  }
            );
            courseDiscussion = courseDiscussion.fetchPage(relation_params);
        }
        else
        {            
            courseDiscussion = courseDiscussion.fetchAll(Object.assign(
                {withRelated:[userData]}               
            )); 
        } 

        courseDiscussion.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })       
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title       :'required|string|maxLength:250|unique:course_discussions',
            slug        :'required|string|alphaDash|maxLength:250|unique:course_discussions',
            description :'required|string',
            user_id     :'required|integer|inDatabase:users,id',
            course_id   :'required|integer|inDatabase:courses,id',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before post your  question.'));
        }
        let discussion_data = _.pickBy({
            title       :formData.title,
            slug        :formData.slug,
            description :formData.description,
            user_id     :formData.user_id,
            course_id   :formData.course_id,
        },_.identity)

        new CourseDiscussion(discussion_data).save().then((discussion)=>{

            notificationAlert.courseDiscussionAlert(discussion_data,'vendor',discussion.id);

            return res.status(200).json(res.fnSuccess(discussion));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let discussion_id = req.params.id;

        CourseDiscussion.where('id',discussion_id).fetch().then((discussion)=>{
            return res.status(200).json(res.fnSuccess(discussion));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let discussion_id   = req.params.id;
        let formData        = req.body;
        let validationRules = {
            title       :'string|maxLength:250',
            description :'string',
            user_id     :'integer|inDatabase:users,id',
            course_id   :'integer|inDatabase:courses,id',
        }

        if(!_.isEmpty()){
            validationRules['slug'] = 'string|alphaDash|maxLength:250|unique:course_discussions'
        }

        let validation  = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let discussion_data = _.pickBy({
            title       :formData.name,
            description :formData.description,
            user_id     :formData.user_id,
            course_id   :formData.course_id
        },_.identity)

        if(!_.isEmpty()){
            discussion_data['slug'] = formData.slug
        }

        CourseDiscussion.where('id',discussion_id).save(discussion_data,{patch:true}).then((discussion)=>{
            return res.status(200).json(res.fnSuccess(discussion));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let discussion_id  = req.params.id;

        CourseDiscussion.where('id',discussion_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseDiscussionController;