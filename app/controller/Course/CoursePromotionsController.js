const CoursePromotions   = Model('Course/CoursePromotions');
const Validator     = Helper('validator');
const moment = require('moment');

const CoursePromotionsController = {

    index:function(req, res,next){

        let relationShip        = [];
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1; 
        let fetchCourse         = _.toBoolean(req.query.course);        
        let fetchCourseUser     = _.toBoolean(req.query.courseUser);       
        let fetchUser           = _.toBoolean(req.query.user);       
        let fetchDate           = _.toBoolean(req.query.date);       
        let is_active           = _.toBoolean(req.query.active); 
        let hasOffer            = _.toBoolean(req.query.offer);
        let fetchWhislist        = _.toBoolean(req.query.whislist);
        let userId               = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let fetch_price          = _.toBoolean(req.query.fetch_price);

        let coursePromotions  =  CoursePromotions.forge().orderBy('-id');    

        if(fetchCourse){

            if(hasOffer){
                let courseMap = {'course':function(q){
                    q.where('status','publish');                    
                }};
                relationShip.push(courseMap);
            } 
            relationShip.push('course.images');
            if(fetchCourseUser){
                relationShip.push('course.user');
                relationShip.push('course.user.profile');
            }  
            if(hasOffer){
                let offerMap = {'course.offer':function(q){
                    q.where('product_offers.is_expired',false);
                    q.whereRaw(`'${moment().format('YYYY-MM-DD')}' BETWEEN DATE(  product_offers.started_on ) AND DATE( product_offers.ended_on )`);
                }};
                relationShip.push(offerMap);
            } 
            if(fetchWhislist){          
                if(userId){
                    let whislistMap = {'course.whislist':function(q){
                            q.select('id','wishlistable_type','wishlistable_id','user_id');
                            q.where('wishlistable_type','courses');  
                            q.where('user_id',userId);  
                        }
                    };
                    relationShip.push(whislistMap);               
                }               
            }   
            if(fetch_price){
                let priceDetails = {'course.pricable':function(q){
                    q.select('id','pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity');
                    q.where('pricable_type','courses')
                }};
                relationShip.push(priceDetails); 
                let paymentCategory = {'course.pricable.payment_category':function(q){
                    q.select('id','title','description');
                    q.where('is_active',1)
                }};            
                relationShip.push(paymentCategory); 
                let payementType = {'course.pricable.payment_type':function(q){
                    q.select('id','title');
                    q.where('is_active',1)
                }};            
                relationShip.push(payementType); 
            }      
        }
        
        if(fetchUser){
            relationShip.push('promotion_user');
        }
       
        if(fetchDate){
            coursePromotions = coursePromotions.whereRaw('DATE( "'+ req.query.date +'" ) BETWEEN DATE( start_on ) AND DATE(  end_on ) ')
        }
        if(is_active){
            coursePromotions = coursePromotions.where('status','active')
        }
        
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    },
                {   withRelated: relationShip   }
            );
            coursePromotions = coursePromotions.fetchPage(relation_params);
        }
        else
        {            
            coursePromotions = coursePromotions.fetchAll(Object.assign(
                    { withRelated: relationShip }
                )
            );
        }

        coursePromotions.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){
        let application      = Config('application');
        let formData        = req.body;                                

        let validationRules = {

            course_id      :   'required|integer|inDatabase:courses,id',
            user_id        :   'required|integer|inDatabase:users,id',
            order_id       :   'required|integer|inDatabase:orders,id',
            start_on       :   'required|dateFormat:YYYY-MM-DD',
            end_on         :   'required|dateFormat:YYYY-MM-DD',
            status         :   `required|in:${application.course_promotion_status.join(',')}`
            
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_course_promotions = _.pickBy({

            course_id          : formData.course_id,
            user_id            : formData.user_id,
            order_id           : formData.order_id, 
            start_on           : formData.start_on, 
            end_on             : formData.end_on, 
            status             : formData.status
        },_.identity);

        new CoursePromotions(save_course_promotions).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
              

        let relationShip = [];

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        CoursePromotions.where(findBy,findFor).fetch({withRelated:relationShip})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 

        let formData            = req.body;  
        let promotion_id        = req.params.id;                      
        let application         = Config('application');

        let validationRules = {

            course_id      :   'required|integer|inDatabase:courses,id',
            user_id        :   'required|integer|inDatabase:users,id',
            order_id       :   'required|integer|inDatabase:orders,id',
            start_on       :    'required|dateFormat:YYYY-MM-DD',
            end_on         :   'required|dateFormat:YYYY-MM-DD',
            status         :   `required|in:${application.course_promotion_status.join(',')}`
        };
       
        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }    

        let update_course_promotions = _.pickBy({

            course_id          : formData.course_id,
            user_id            : formData.user_id,
            order_id           : formData.order_id, 
            start_on           : formData.start_on, 
            end_on             : formData.end_on, 
            status             : formData.status

        },_.identity);

        CoursePromotions.where('id',promotion_id).save(update_course_promotions,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){

        var promotion_id  = req.params.id;
        
        CoursePromotions.where('id',promotion_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }

};

module.exports = CoursePromotionsController;