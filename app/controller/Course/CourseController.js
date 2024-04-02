const Validator     = Helper('validator');
const Course        = Model('Course/Course');
const Images        = Model('Images');
const Resizer       = Helper('resizer');
const Profile       = Model('Profile');
const moment        = require('moment');
const User        = Model('User');


const ResizeAndSave = async function(formData,originalImage,thumbnailOriginalImage,entityType,entityId){

    if(!originalImage ||!thumbnailOriginalImage || !entityType || !entityId){
        return false;
    }

    let imageOject          = {};
    let application         = Config('application');
    let courseImageRatio    = application.course_image_ratio;
    let allowImageType      = _.map(courseImageRatio,'key');
    let cropImageRato       = _.difference(allowImageType,_.keys(formData),_.isEqual);
    let imageRatio          = _.filter(courseImageRatio,(v) => _.contain(cropImageRato,v.key));
    let sendImage           = _.intersectionWith(allowImageType,_.keys(formData),_.isEqual);
    let imageData           = _.pickBy(formData,(v,index) => _.contain(sendImage,index));

    await Resizer.setSize(imageRatio)
            .setResizeableImg(thumbnailOriginalImage)
            .get()
            .then((images)=>{
                _.each(images,(v)=>{
                    imageOject[v.type] = v.url
                })
            });

    imageOject['imagable_type'] = entityType;
    imageOject['imagable_id']   = entityId;
    imageOject['original']      = originalImage;
    imageOject['thumbnail_original'] = thumbnailOriginalImage;
    imageOject                  = _.assign(imageOject,imageData);

    new Images().createOrDelete({
        imagable_type   : entityType,
        imagable_id     : entityId
    },imageOject).then((r)=> console.log(r));
}

const CourseController = {

    index:function(req, res,next){

        let orderbyColumn   = ['id','created_at','rating','usd_price','sxl_price','total_price'];
        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let created_by      = _.toBoolean(req.query.created_by) ? _.toInteger(req.query.created_by) : false;
        let order_by        = _.toBoolean(req.query.order_by) ? req.query.order_by : '-id';
        let categories      = _.toBoolean(req.query.categories);
        let user            = _.toBoolean(req.query.user);
        let category        = _.toBoolean(req.query.category);
        let images          = _.toBoolean(req.query.images);
        let is_publish      = _.toBoolean(req.query.is_publish) ? req.query.is_publish : false;
        let is_featured     = _.toInteger(req.query.is_featured) ? req.query.is_featured : false;
        let reviewCount     = _.toBoolean(req.query.review_count);
        let courseModules   = _.toBoolean(req.query.courseModules);
        let has_course_modules   = _.toBoolean(req.query.course_modules);
        let has_course_lectures  = _.toBoolean(req.query.course_lectures);
        let has_course_standers  = _.toBoolean(req.query.course_standers);
        let string               = req.query.string || false;
        let price                = req.query.price || false;
        let is_active            = req.query.is_active || false;
        let is_delete            = req.query.is_delete || false;
        let fetchCoursePromotion = _.toBoolean(req.query.course_promotion);
        let courseProgress       = _.toBoolean(req.query.course_progress);
        let hasOffer             = _.toBoolean(req.query.offer);
        let fetchWhislist        = _.toBoolean(req.query.whislist);
        let userId               = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let resellerId           = _.toInteger(req.query.reseller_id) ? req.query.reseller_id : false;
        let fetch_price          = _.toBoolean(req.query.fetch_price);
        let priceFilter          = req.query.price_filter || false;
        let fetchOrderCount      = req.query.order_count || false;
        let fetchApprovedCourse        = _.toBoolean(req.query.isApproved);

        let course               =  Course.forge();
        let relationMapping      = [];

        if(fetchApprovedCourse){
            course = course.where('approved_status',1);
        }

        if(is_active){
            course = course.where('is_active',1);
        }
        if(is_delete){
            course = course.where('courses.is_delete',0);
        }
        if(string){
            course = course.where(function () {
                this.where('title', 'like', `%${string}%`)
                    .orWhere('slug', 'like', `%${string}%`)
                    .orWhere('sub_title', 'like', `%${string}%`)
                    .orWhere('description', 'like', `%${string}%`)
                    .orWhere('primary_thought', 'like', `%${string}%`)
            })
        }
        // if (price && _.contain(price, ':')) {
        //     price = _.chain(price).split(':').filter().map(Number).sortBy().take(2).value();
        //     course = course.where(function () {
        //         this.whereBetween('price', price)
        //     })
        // }

        if(categories){
            let categoryMap = {'categories':function(q){
                q.select('category_id as id','name','slug');
                q.where('categories.is_active',1)
                q.where('categories.type','courses')
            }};
            relationMapping.push(categoryMap);
        }


        if(images){
            relationMapping.push('images');
        }

        if(fetchWhislist){
            if(userId){
                let whislistMap = {'whislist':function(q){
                    q.select('id','wishlistable_type','wishlistable_id','user_id');
                    q.where('wishlistable_type','courses');
                    q.where('user_id',userId);
                }
            };
            relationMapping.push(whislistMap);
            }
        }

        if(user){
            let userMap = {'user':function(q){
                    q.select('id','user_name','avatar','is_kyc');
                },
                'user.profile':function(q){
                    q.select('first_name','middle_name','last_name','user_id')
                }
            };
            relationMapping.push(userMap);
        }

        if(fetchCoursePromotion){
            let offerMap = {'course_promotions':function(q){
                q.where('course_promotions.status','active');
            }};
            relationMapping.push(offerMap);
        }
        if(hasOffer){
            let offerMap = {'offer':function(q){
                q.where('is_expired',false);
                q.whereRaw(`'${moment().format('YYYY-MM-DD')}' BETWEEN DATE(  product_offers.started_on ) AND DATE( product_offers.ended_on )`);
            }};
            relationMapping.push(offerMap);
        }

        if(category){
            category  = _.isArray(req.query.category) ? req.query.category : [req.query.category];
            course      = course.whereExists(function(){
                this.from('categories')
                this.innerJoin('category_course', 'categories.id', 'category_course.category_id');
                this.whereRaw('courses.id = category_course.course_id');
                this.whereIn('category_id',category);
            });
        }

        if(created_by){
            course = course.where('created_by',created_by);
        }
        if(is_publish){
            course = course.where('courses.status','publish');
        }
        if(is_featured){
            course = course.where('is_featured',is_featured);
        }
        if(reviewCount) {
            let reviewMap = {'reviews':function(q){
                q.select('id','reviewable_id');
            }};
            relationMapping.push(reviewMap);
        }
        //======================================================
        if(has_course_standers){
            let courseStanders = 'course_standers';
            relationMapping.push(courseStanders);
        }
        //======================================================
        if(has_course_modules){
            let courseModules = 'course_modules';
            relationMapping.push(courseModules);
        }
        //======================================================
        if(has_course_lectures){
            let courseLectures = 'course_modules.course_lectures';
            relationMapping.push(courseLectures);
            if(courseProgress){
                relationMapping.push('course_modules.course_lectures.user_course_progresses');
            }
        }
        //======================================================
        /*****
        course = course.withCount('course_modules.course_lectures as lecture_count')
            .withCount('course_modules.course_lectures as videRawo_count',function(q){
                q.where('lecture_mode','video')
            })
            .withCount('course_modules.course_lectures as pdf_count',function(q){
                q.where('lecture_mode','pdf')
            });
        *****/
        if(fetch_price){
            let priceDetails = {'pricable':function(q){
                q.select('id','pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity','id as product_price_id');
                q.where('pricable_type','courses')
            }};
            relationMapping.push(priceDetails);
            let paymentCategory = {'pricable.payment_category':function(q){
                q.select('id','title','description');
                q.where('is_active',1)
            }};
            relationMapping.push(paymentCategory);
            let payementType = {'pricable.payment_type':function(q){
                q.select('id','title');
                q.where('is_active',1)
            }};
            relationMapping.push(payementType);
        }
        if(order_by && _.contain(orderbyColumn,_.lTrim(order_by,['-','+'])) ){
            if(priceFilter){
                let orderByStatus = _.contain(orderbyColumn,_.lTrim(priceFilter,['+'])) ? 'ASC' : 'DESC';
                switch(_.lTrim(priceFilter,['-','+'])){
                    case 'total_price':
                    course = course.query(function(q) {
                        q.joinRaw(`LEFT JOIN product_prices ON product_prices.pricable_id = courses.id AND product_prices.pricable_type =  'courses'`)
                        q.whereRaw(`courses.status =  'publish' AND courses.is_active =1 AND courses.is_delete =0 AND product_prices.pricable_type =  'courses'`)
                        .orderBy(`product_prices.${_.lTrim(priceFilter,['-','+'])}`,'DESC')
                    })
                    break;
                    case 'free':
                    course = course.query(function(q) {
                        q.leftJoin('product_prices','product_prices.pricable_id','courses.id')
                        q.whereRaw(`courses.status =  'publish' AND courses.is_active =1 AND courses.is_delete =0 AND product_prices.pricable_id IS NULL`)
                    })
                    break;
                    default:
                    course = course.query(function(q) {
                        q.joinRaw(`LEFT JOIN product_prices ON product_prices.pricable_id = courses.id
                        AND product_prices.pricable_type =  'courses'`)
                        q.whereRaw(`courses.status =  'publish' AND courses.is_active =1 AND courses.is_delete =0`)
                        .orderBy(`product_prices.${_.lTrim(priceFilter,['-','+'])}`,orderByStatus)
                    })
                }
            }
            else
            {
                course =  course.orderBy(order_by);
            }
        }

        if(resellerId) {
            course = course.query(function(q) {
                q.leftJoin('reseller_product', 'reseller_product.product_id', 'courses.id')
                .where('reseller_product.is_delete', 0)
                .where('reseller_product.user_id', resellerId);
            })
        }

        if(fetchOrderCount){
            let orderDetails = {'order_details':function(q){
                q.select('id','productable_id');
                q.where('productable_type','courses');
                }
            };
            relationMapping.push(orderDetails);


        }
        if(has_pagination){
            course = course.fetchPage(_.assign({pageSize:limit,page:page},{withRelated:relationMapping}));
        }else{
            course = course.fetchAll({withRelated:relationMapping});
        }

        course.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){

        let formData        = req.body;
        let application     = Config('application');
        let validationRules = {
            title               :'required|string|maxLength:250|unique:courses',
            sub_title           :'string|maxLength:250',
            description         :'string',
            primary_thought     :'string|maxLength:250',
            promotional_video   :'url',
            duration            :'decimal',
            original            :'url|chkUrlFormate',
            //price               :'decimal',
            currency            :'maxLength:4',
            created_by          :'required|integer',
            created_for         :'required|integer',
            course_stander_id   :'integer',
            course_time_id      :'required|integer',
            status              :`required|in:${application.course_status.join(',')}`,
            locale              :'maxLength:2',
            is_featured         :'boolean',
            categories          :'required'
        }

        if(await Profile.where('user_id',formData.created_by).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before create course.'));
        }

        // if(await User.where('id',formData.created_by).where('is_kyc',1).count() === 0){
        //     return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        // }
        let validation = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {

            if(validation.errors.title.rule !== undefined && validation.errors.title.rule === 'unique'){
                return res.status(422).json(res.fnError('This title is already used, please use a new title'));
            }
            return res.status(422).json(res.fnError(validation.errors));
        }

        let course_data = _.pickBy({
            title               : formData.title,
            slug                : await generateSlug(Course,formData.title),
            sub_title           : formData.sub_title,
            description         : formData.description,
            primary_thought     : formData.primary_thought,
            promotional_video   : formData.promotional_video,
            duration            : formData.duration,
            //price               : formData.price,
            currency            : formData.currency,
            created_by          : formData.created_by,
            created_for         : formData.created_for,
            course_stander_id   : formData.course_stander_id,
            course_time_id      : formData.course_time_id,
            status              : formData.status,
            locale              : formData.locale,
            is_featured         : formData.is_featured,
            meta_description    : formData.meta_description,
            meta_keywords       : formData.meta_keywords
        },_.identity)


        new Course().save(course_data).then((course)=>{

            let categories = _.isArray(formData.categories) ? formData.categories : [formData.categories];
            course.categories().attach(_.filter(categories));
            return course;

        }).then((course)=>{
            if(formData.thumbnail){
                let imageOject = [];
                let imageData = {
                    imagable_type : 'courses',
                    imagable_id : course.get('id'),
                    thumbnail : formData.thumbnail,
                    banner : formData.banner,
                    original : formData.original
                }
                imageOject.push(imageData);

                new Images().createOrDelete({
                    imagable_type   : 'courses',
                    imagable_id     : course.get('id')
                },imageOject);
                //ResizeAndSave(formData,formData.original_image,formData.thumbnail_original,'courses',course.get('id'))
            }
            return res.status(200).json(res.fnSuccess(course));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    show: async function(req, res,next){

        let findFor              = req.params.id;
        let findBy               = _.isDigit(findFor) ? 'courses.id':'courses.slug';
        let has_course_modules   = _.toBoolean(req.query.course_modules);
        let has_course_lectures  = _.toBoolean(req.query.course_lectures);
        let has_course_standers  = _.toBoolean(req.query.course_standers);
        let has_categories       = _.toBoolean(req.query.categories);
        let has_course_coupons   = _.toBoolean(req.query.course_coupons);
        let has_user             = _.toBoolean(req.query.user);
        let courseStandard       = _.toBoolean(req.query.course_standard);
        let has_announcements    = _.toBoolean(req.query.announcements);
        let courseProgress       = _.toBoolean(req.query.course_progress);
        let reviewCount          = _.toBoolean(req.query.review_count);
        let has_offer            = _.toBoolean(req.query.offer);
        let fetchWhislist        = _.toBoolean(req.query.whislist);
        let userId               = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let fetchReview          = _.toBoolean(req.query.review);
        let fetchCustomerCount   = _.toBoolean(req.query.customer_count);
        let fetch_price          = _.toBoolean(req.query.fetch_price);
        let fetchApprovedCourse        = _.toBoolean(req.query.isApproved);

        let relationData         = [[],''];
        let relationMapping      = {};


        let courseDetail         = Course;

        if(fetchApprovedCourse){
            courseDetail             = courseDetail.where('approved_status',1);
        }

        if(has_course_modules){
            relationData[0].push( 'course_modules');
        }

        if(has_course_modules && has_course_lectures){
            relationData[0].push('course_lectures');
            if(courseProgress){
                relationData[8] = 'course_modules.course_lectures.user_course_progresses';
            }
        }

        //======================================================
        if(has_course_standers){
            relationData[9] = 'course_standers';
        }
        //======================================================
        if(has_categories){
            let categoryMap = {'categories':function(q){
                q.select('categories.*');
                q.where('categories.is_active',1)
                q.where('categories.type','courses')
            }};
            // relationMapping.push(categoryMap);
            relationData[1] = categoryMap;
        }

        if(has_course_coupons){
            let courseCoupons = {'course_coupons':function(q){
                q.whereRaw(`'${moment().format('YYYY-MM-DD')}' BETWEEN DATE(  course_coupons.started_on ) AND DATE( course_coupons.ended_on )`);
            }};
            relationData[2] = courseCoupons;

           // relationData[2] = 'course_coupons';
        }

        // if(has_offer){
        //     let offerMap = {'offer':function(q){
        //         q.where('is_expired',false);
        //         q.whereRaw(`'${moment().format('YYYY-MM-DD')}' BETWEEN DATE(  product_offers.started_on ) AND DATE( product_offers.ended_on )`);
        //     }};
        //     relationData[3] = offerMap;
        // }

        if(fetchWhislist){
            if(userId){
                let whislistMap = {'whislist':function(q){
                        q.select('id','wishlistable_type','wishlistable_id','user_id');
                        q.where('wishlistable_type','courses');
                        q.where('user_id',userId);
                    }
                };
            relationData[11] = whislistMap;
            }
        }

        if(fetchReview){
            if(userId){
                let reviewDetailMap = {'reviews':function(q){
                        q.select('id','reviewable_type','reviewable_id','experience','review_note','rating_id','user_id');
                        q.where('reviewable_type','courses');
                        q.where('user_id',userId);
                    }
                }
                relationData[12] = reviewDetailMap;
            }
        }
        if(has_user){
            relationData[4] = {'user':function(q){
                q.select('id','user_name','avatar','is_kyc')
            },'user.profile':function(q){
                q.select('id','user_id','first_name','middle_name','last_name','head_line','biography','social_links')
            }};

            if(has_announcements){
                relationData[7] = 'user.user_announcements';
            }
        }
        relationData[5] = 'images';

        if(courseStandard){
            relationData[6] = 'course_standers';
        }
        if(reviewCount) {
            let reviewMap = {'reviews':function(q){
                q.select('id','reviewable_id');
            }};
            relationData[10] = reviewMap;
        }

        if(fetchCustomerCount){
            let noOfStudents = {'user_course':function(q){
                q.select('id','course_id')
                q.where('user_id',userId)
            }};
            relationData[13] = noOfStudents
        }

        if(fetch_price){
            let priceDetails = {'pricable':function(q){
                q.select('id','pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity','sxl_to_usd_rate','id as product_price_id');
                q.where('pricable_type','courses')
            }};
            relationData[14] = priceDetails;
            let paymentCategory = {'pricable.payment_category':function(q){
                q.select('id','title','description');
                q.where('is_active',1)
            }};
            relationData[15] = paymentCategory;
            let payementType = {'pricable.payment_type':function(q){
                q.select('id','title');
                q.where('is_active',1)
            }};
            relationData[16] = payementType;
        }

        let mapData = _.map(relationData,(v)=>{
            return _.isArray(v) ? _.join(v,'.') : v;
        })

        let mapDataArray = _.remove(mapData,(v) => !_.isEmpty(v));

        relationMapping = {
            withRelated: mapDataArray
        }

        courseDetail.where(findBy,findFor)
            .withCount('course_modules.course_lectures as pdf_count',function(qb){
                qb.where('lecture_mode','pdf')
            })
            .withCount('course_modules.course_lectures as video_count',function(qb){
                qb.where('lecture_mode','video')
            })
            .fetch(relationMapping).then((course)=>{
                return res.status(200).json(res.fnSuccess(course));
            })
            .catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
    },

    update: async function(req, res,next){

        let course_id        = req.params.id;
        let formData         = req.body;
        let application      = Config('application');

        let validationRule   = {
            title               :'string|maxLength:250',
            sub_title           :'string|maxLength:250',
            description         :'string',
            primary_thought     :'string|maxLength:250',
            promotional_video   :'url',
            duration            :'decimal',
            thumbnail           :'url|fileType:png,jpg,jpeg',
            //price               :'decimal',
            currency            :'maxLength:4',
            created_by          :'integer',
            created_for         :'integer',
            course_stander_id   :'integer',
            course_time_id      :'integer',
            status              :`in:${application.course_status.join(',')}`,
            locale              :'maxLength:2',
            is_featured         :'boolean',
            categories          :'array'
        };

        let validation  = new Validator(formData,validationRule);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        // if(await User.where('id',formData.created_by).where('is_kyc',1).count() === 0){
        //     return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        // }

        let course_data = {
            title               : formData.title,
            sub_title           : formData.sub_title,
            description         : formData.description,
            primary_thought     : formData.primary_thought,
            promotional_video   : formData.promotional_video,
            duration            : formData.duration,
            //price               : formData.price,
            currency            : formData.currency,
            created_by          : formData.created_by,
            created_for         : formData.created_for,
            course_stander_id   : formData.course_stander_id,
            course_time_id      : formData.course_time_id,
            status              : formData.status,
            locale              : formData.locale,
            is_featured	        : formData.is_featured,
            meta_description    : formData.meta_description,
            meta_keywords       : formData.meta_keywords
        };

        Course.where('id',course_id).save(course_data,{patch:true}).then((course)=>{
            return Course.where('id',course_id).fetch({withRelated:'images'});
        })
        .then((course)=>{

            if(formData.thumbnail){

                let imageOject          = [];
                let imageData = {
                    imagable_type : 'courses',
                    imagable_id : course.get('id'),
                    thumbnail : formData.thumbnail,
                    banner : formData.banner,
                    original : formData.original
                }
                imageOject.push(imageData);

                new Images().createOrDelete({
                    imagable_type   : 'courses',
                    imagable_id     : course.get('id')
                },imageOject);
                // ResizeAndSave(formData,formData.original,formData.thumbnail_original,'courses',course.get('id'))
            }

            if(formData.categories){
                let categories = _.isArray(formData.categories) ? formData.categories : [formData.categories];
                course.categories().detach();
                course.categories().attach(_.filter(categories));
            }

            return course;
        })
        .then((course)=>{
            return res.status(200).json(res.fnSuccess(course));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    destroy:function(req,res,next){

        let course_id     = req.params.id;

        Course.where('id',course_id).destroy({required:false}).then((response)=>{
            let condition = {
                imagable_type : 'courses',
                imagable_id   : course_id
            };
            Images.where(condition).destroy();
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    }
}

module.exports = CourseController;