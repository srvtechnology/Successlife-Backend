const Reviews     = Model('Review/Reviews');
const Validator   = Helper('validator');
const Bookshelf   = Config('database');
const Profile     = Model('Profile');
const Product     = Model('Product/Product');
const Courses     = Model('Course/Course');
const notificationAlert = Helper('notification-alert');

const ReviewsController = {

    index:function(req, res,next){        
        let relationShip    = [];

        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;   
        let user            = _.toBoolean(req.query.user)  ? 'user'                        : false; 
        let products        = _.toBoolean(req.query.products)  ? 'product_details'         : false;
        let productUser     = _.toBoolean(req.query.product_user)  ? 'product_details.user': false;    
        let rating          = _.toBoolean(req.query.rating)  ? 'rating'                    : false; 
        let has_profile     = _.toBoolean(req.query.profile)  ? 'user.profile'             : false;
        let reviewable_id   = _.toInteger(req.query.reviewable_id);          
        let reviewable_type = _.toString(req.query.reviewable_type);  

        let reviews =  Reviews.forge().orderBy('-id');

        if(reviewable_id){
            reviews.where('reviewable_id',reviewable_id);
            reviews.where('reviewable_type',reviewable_type);
        }
        
        if(user){
            relationShip.push(user);
            if(has_profile){
                relationShip.push(has_profile);
            }
        }
        if(products){
            relationShip.push(products);
            if(productUser){
                relationShip.push(productUser);
            }
        }
        if(rating){
            relationShip.push(rating);            
        }       
        
        if(has_pagination)
        {
            let relation_params   = Object.assign(
                {pageSize:limit,page:page},
                {withRelated:relationShip}
            );
            reviews = reviews.fetchPage(relation_params);
        } 
        else
        {            
            reviews = reviews.fetchAll(Object.assign({withRelated:relationShip}));     
        }

        reviews.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    }, 

    store:async function(req,res,next){    
        let formData        = req.body;                        
        let application     = Config('application'); 

        let Product     = Model('Product/Product');
        let Courses     = Model('Course/Course');

        let validationRules = {   

            rating_id           : 'required|integer',
            user_id             : 'required|integer|inDatabase:users,id',
            reviewable_id       : 'required|integer', 
            reviewable_type     : `in:${application.reviews_type.join(',')}`,            
            experience          : 'required|string|maxLength:254',
            review_note         : 'required|string|maxLength:254'            
        };

        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before submit your review .'));
        }

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let save_reviews = {

            rating_id       : formData.rating_id,
            user_id         : formData.user_id,
            reviewable_id   : formData.reviewable_id,
            reviewable_type : formData.reviewable_type,
            experience      : formData.experience,
            review_note     : formData.review_note
        }

        new Reviews(save_reviews).save()
        .then((response)=>{            
           
            notificationAlert.reviewNotify(save_reviews,response.id);

            Bookshelf.knex('reviews')
                .avg('ratings.count as rating')
                .innerJoin('ratings', 'ratings.id', 'reviews.rating_id')
                .whereRaw('reviews.reviewable_id =  "'+formData.reviewable_id+'" and reviews.reviewable_type = "'+formData.reviewable_type+'"' )
            .then((response)=>{                
                switch(formData.reviewable_type){
                    case("products"):  
                        Product.where('id',formData.reviewable_id).save({'rating':response[0].rating},{patch:true});
                    break;
                    case("courses"): 
                        Courses.where('id',formData.reviewable_id).save({'rating':response[0].rating},{patch:true});
                    break;
                    default:
                        console.log('Nothing');
                    break; 
                } 
            })  

            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        }); 
    },

    show:function(req, res,next){

        let relationShip    = [];

        let user            = _.toBoolean(req.query.user)  ? 'user'                        : false; 
        let products        = _.toBoolean(req.query.products)  ? 'product_details'         : false;
        let productUser     = _.toBoolean(req.query.product_user)  ? 'product_details.user': false;    
        let rating          = _.toBoolean(req.query.rating)  ? 'rating'                    : false; 
        let has_profile     = _.toBoolean(req.query.profile)  ? 'user.profile'             : false;

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        if(user){
            relationShip.push(user);
            if(has_profile){
                relationShip.push(has_profile);
            }
        }
        if(products){
            relationShip.push(products);
            if(productUser){
                relationShip.push(productUser);
            }
        }
        if(rating){
            relationShip.push(rating);            
        }    

        Reviews.where(findBy,findFor).fetch(Object.assign({withRelated:relationShip})).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
 
    update:async function(req, res,next){ 
        let formData             = req.body;
        let reviews_id           = req.params.id;

        let application     = Config('application'); 

        let validationRules  = {
            rating_id           : 'required|integer',
            user_id             : 'required|integer',
            reviewable_id       : 'required|integer',
            reviewable_type     : `in:${application.reviews_type.join(',')}`,            
            experience          : 'required|string|maxLength:254',
            review_note         : 'required|string|maxLength:254' 
        }      

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_reviews = {
            rating_id       : formData.rating_id,
            user_id         : formData.user_id,
            reviewable_id   : formData.reviewable_id,
            reviewable_type : formData.reviewable_type,
            experience      : formData.experience,
            review_note     : formData.review_note
        }

        Reviews.where('id',reviews_id).save(update_reviews,{patch:true})
        .then((response)=>{

            Bookshelf.knex('reviews')
            .avg('ratings.count as rating')
            .innerJoin('ratings', 'ratings.id', 'reviews.rating_id')
            .whereRaw('reviews.reviewable_id =  "'+formData.reviewable_id+'" and reviews.reviewable_type = "'+formData.reviewable_type+'"' )
        .then((response)=>{                
            switch(formData.reviewable_type){
                case("products"):  
                    Product.where('id',formData.reviewable_id).save({'rating':response[0].rating},{patch:true});
                break;
                case("courses"): 
                    Courses.where('id',formData.reviewable_id).save({'rating':response[0].rating},{patch:true});
                break;
                default:
                    console.log('Nothing');
                break; 
            } 
        }) 


            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){

        var reviews_id  = req.params.id;
        
        Reviews.where('id',reviews_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = ReviewsController;