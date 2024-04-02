
const Validator   = Helper('validator');
const ResellerProduct   = Model('./Reseller/ResellerProduct');
const ResellerProductLog   = Model('./Reseller/ResellerProductLog');
const Profile       = Model('Profile');
const User       = Model('User');
const Course       = Model('Course/Course');
const moment = require('moment');
const notificationAlert = Helper('notification-alert');

const ResellerProductController = {

    index:function(req, res,next){

        let relationShip = [];
        let has_pagination     = _.toBoolean(req.query.pagination);
        let limit              = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page               = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;       
        let user_id            = _.toInteger(req.query.user_id);   
        let fetchReseller      = _.toBoolean(req.query.reseller);
        let fetchCourse        = _.toBoolean(req.query.courses);
        let reviewCount        = _.toBoolean(req.query.review_count);
        let CourseCreatedBy    = _.toBoolean(req.query.created_by);

        let resellerProduct  =  ResellerProduct.forge().orderBy('-id');    


        if (fetchReseller) {
            let resellerMap = {
                'reseller': function(q) {
                    q.select('id','user_name','avatar')
                },
                'reseller.profile':function(q){
                    q.select('id','user_id','first_name','middle_name','last_name','head_line','biography','social_links')
                }
            };
            relationShip.push(resellerMap);
        }

        if(fetchCourse){
            relationShip.push('courses');
            relationShip.push('courses.images');
            if(reviewCount) {
                let reviewMap = {'courses.reviews':function(q){
                    q.select('id','reviewable_id');                
                }};
                relationShip.push(reviewMap);
            }
            if(CourseCreatedBy){
                let userMap = {'courses.user':function(q){
                    q.select('id','user_name','avatar');
                },
                'courses.user.profile':function(q){
                    q.select('first_name','middle_name','last_name','user_id')
                }
                };
                relationShip.push(userMap);
            }
        }

        resellerProduct = resellerProduct.where('is_delete', 0);    
              
        if(user_id){
            resellerProduct = resellerProduct.where('user_id',user_id);            
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip   }
            );
            resellerProduct = resellerProduct.fetchPage(relation_params);
        }
        else
        {            
            resellerProduct = resellerProduct.fetchAll(Object.assign(
                    { withRelated:relationShip }
                )
            );
        }


        resellerProduct.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
       
    },   
 
    store: async function(req,res,next){
        let formData = req.body;               
       
        if (!_.isArray(formData.data)) {
            return res.status(400).json(res.fnError('Data must be in array!.'));
        }

        let validation = new Validator({
            items: formData.data,   
            user_id: 'required|integer|inDatabase:user,id', 
            status: `required|in:${_.join(getConfig('application.reseller_product_status'), ',')}`,
        },
            {
                'items': 'required|array',
                'items.*.product_id': 'required|integer|inDatabase:courses,id'                
            }
        );

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
       
        if(await User.where('id',formData.user_id).where('is_active',1).where('is_block',0).count() === 0){
            return res.status(400).json(res.fnError('Oops!. Something went wrong. Please Contact with your site administrator'));
        }

        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Your profile is not completed. Please complete your profile.'));
        }

        let profileData = await User                            
                            .query((qb)=>{
                                qb.select('users.id as uid','role_user.user_id as ruid','profiles.user_id as puid','profiles.first_name','profiles.middle_name','profiles.last_name')
                                qb.leftJoin('profiles','profiles.user_id','users.id')
                                qb.leftJoin('role_user','role_user.user_id','users.id')
                                qb.leftJoin('roles','roles.id','role_user.role_id')
                                qb.where('users.id',formData.user_id)  
                                qb.where('roles.name','reseller')
                            })
                            .fetch();    
                            
        if(profileData && profileData !== undefined && profileData !== null ){
           
            try{
                let userData = profileData.toJSON();

                let resellerUrl = '';

                if(!userData.middle_name){
                    resellerUrl += `${userData.first_name}-${userData.last_name}-${userData.uid}`.toLowerCase().replace(' ','-');
                }
                else{
                    resellerUrl += `${userData.first_name}-${userData.middle_name}-${userData.last_name}-${data.uid}`.toLowerCase().replace(' ','-');
                } 
                
                let courseIds = _.map(formData.data,'product_id');

                if(await ResellerProduct.whereIn('product_id',courseIds).where('user_id',formData.user_id).where('is_delete',0).count() > 0){
                    return res.status(400).json(res.fnError('You have already applied your selected courses!.'));
                }

                let courseDetails = await Course
                        .query((qb)=>
                            {
                            qb.column('slug','title')
                            qb.where('is_active',1)
                            qb.where('is_delete',0)
                            qb.whereIn('id',courseIds)
                            
                        })
                        .fetchAll();                        
                let resultArr = await ResellerProductController.resellerProductDataGenerate(courseDetails,formData,resellerUrl);
               
                let resellerLog = await ResellerProductController.resellerProductDataLog(courseDetails,userData,formData);                              
                
                let save_data = null;
                
                new ResellerProduct().createOrUpdate(resultArr,['user_id','product_id','affiliated_link','status'])
                .then((ResellerProductResponse)=>{ 
                    save_data = ResellerProductResponse;        
                    notificationAlert.resellerAppliedForProduct(courseDetails,userData,formData);

                    new ResellerProductLog().batchInsert(resellerLog);                    
                })
                .then((response)=>{
                    return res.status(200).json(res.fnSuccess(`Waiting for admin approval`)); 
                })
                .catch((err)=>{
                    return res.status(400).json(res.fnError(err)); 
                })
            }
            catch(err){
                return res.status(400).json(res.fnError(err));    
            }
        } 
        else{
            return res.status(400).json(res.fnError('Please register as a reseller profile!.'));
        } 
    },

    show:function(req, res,next){

        
    },  

    update: async function(req, res,next){     
        
    },
 
    destroy:function(req,res,next){        
    },


    async resellerProductDataGenerate(courseData,postData,url){  
        
        let resllerProductData    = [];
        if (_.isObject(courseData)) {
            let courseObj = courseData.toJSON();
            _.map(courseObj,function(value,index){                
                let dataArr = {                    
                    affiliated_link:`${getEnv('APP_URL')}/affiliate/${url}/courses/${value.slug}`,
                    user_id: postData.user_id,
                    product_id: postData.data[index].product_id,
                    status: postData.status,
                    id: postData.data[index].id
                }
                resllerProductData.push(dataArr);                
            })            
            
            return await resllerProductData;            
        }
        else{
            return null;
        }        
    },

    async resellerProductDataLog(courseData,userData,formData){
       
        let courseObj = courseData.toJSON();
        let logArr = [];

        _.map(courseObj,function(value,index){                        
            let dataArr = {                    
                data:`${userData.first_name} ${userData.last_name} want to resell this course ( ${value.title} ) on ${moment().format('YYYY-MM-DD')} `,
                logable_id: formData.data[index].product_id,
                logable_type: 'courses',
                user_id: formData.user_id
            }
            logArr.push(dataArr);                      
        }) 
        return await logArr;                    
    }
}

module.exports = ResellerProductController;