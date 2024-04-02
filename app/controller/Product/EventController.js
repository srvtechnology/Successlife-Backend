
const Validator  = Helper('validator');
const Product    = Model('./Product/Product');
const Event      = Model('Product/Event');
const Images     = Model('Images');
const Resizer    = Helper('resizer');
const Profile    = Model('Profile');
const User        = Model('User');
const moment        = require('moment');
const OrderDetails  = Model('Order/OrderDetails');
const Bookshelf = Config('database');

const EventController = {

    index:function(req, res,next){

        let relationShip    = [];
        // let orderbyColumn   = ['title'];
        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let is_publish      = _.toBoolean(req.query.is_publish);
        let is_delete       = _.toBoolean(req.query.is_delete);
        let is_featured     = req.query.is_featured;
        let user_id         = _.toInteger(req.query.user_id);
        let order_by        = _.toBoolean(req.query.order_by) ? req.query.order_by : false;
        let category        = _.toBoolean(req.query.category) ? req.query.category : '';

        let categories      = _.toBoolean(req.query.categories);
        let images          = _.toBoolean(req.query.images);
        let user            = _.toBoolean(req.query.user);
        let event           = _.toBoolean(req.query.event);
        let eventCountry    = _.toBoolean(req.query.event_country);
        let eventState      = _.toBoolean(req.query.event_state);
        let eventCity       = _.toBoolean(req.query.event_city);
        let userProfile     = _.toBoolean(req.query.profile);
        let reviewCount     = _.toBoolean(req.query.review_count);
        let fetchSpeaker    = _.toBoolean(req.query.event_speaker);
        let fetchPrice      = _.toBoolean(req.query.fetch_price);
        let fetchComingSoon = _.toBoolean(req.query.coming_soon);
        let fetchPastEvent  = _.toBoolean(req.query.past_event);
        let country_id      = _.toInteger(req.query.country_id);
        let dateFilter      = req.query.date_filter || false;
        let orderBy         = req.query.order_by || false;
        let string          = req.query.string || false;
        let is_active       = req.query.is_active || false;
        let fetchOnlySxl    = _.toBoolean(req.query.only_sxl);
        let fetchOnlyUSD    = _.toBoolean(req.query.only_usd);
        let fetchUSDSXL     = _.toBoolean(req.query.usd_sxl);
        let fetchfastSelling = req.query.is_fast_selling || false;
        let speaker_id      = _.toInteger(req.query.speaker_id);
        let attendeeInfo    = _.toBoolean(req.query.attendee_info);
        let fetchApprovedEvent        = _.toBoolean(req.query.isApproved);

        if(categories){
            let eventCategory = {'categories':function(q){
                q.select('categories.id','name','type','icon','description','slug','is_active')
                q.where('is_active',1)
            }}
            relationShip.push(eventCategory);
        }
        if(images){
            let eventTicketImages = {'images':function(q){
                q.select('id','imagable_type','imagable_id','thumbnail','imagable_type');
                q.where('imagable_type','products')
                q.orderBy('id','DESC')
            }};
            relationShip.push(eventTicketImages);
        }
        if(user){
            relationShip.push('user');
            relationShip.push('user.profile');
        }
        if(event){
            relationShip.push('event');
            if(eventCountry){
                relationShip.push('event.country');
            }
            if(eventState){
                relationShip.push('event.state');
            }
            if(eventCity){
                relationShip.push('event.city');
            }
            if(attendeeInfo){
                let attendeeInfoCount = {'event.attendeeInformation':function(q){
                        q.where('ticket_sent_status',1)
                    }
                }
                relationShip.push(attendeeInfoCount);
            }
        }

        if(userProfile){
            relationShip.push('user.profile');
        }
        if(reviewCount) {
            let reviewMap = {'reviews':function(q){
                q.select('id','reviewable_id');
            }};
            relationShip.push(reviewMap);
        }
        if(fetchSpeaker){
            relationShip.push('event_speakers');
        }
        if(fetchPrice){
            let priceDetails = {'pricable':function(q){
                q.select(Bookshelf.knex.raw('`product_prices`.`pricable_id` ,  `product_prices`.`pricable_type` ,  `product_prices`.`payment_type_id` ,  `product_prices`.`payment_category_id` , `product_prices`.`total_price` ,  `product_prices`.`sxl_price` ,  `product_prices`.`usd_price` ,  `product_prices`.`quantity` ,  `product_prices`.`id` AS `product_price_id` , ( SELECT COUNT( pricable_id ) FROM order_details WHERE order_details.pricable_id = product_prices.id ) AS total_order'));
                q.where('product_prices.pricable_type','products')
            }};
            relationShip.push(priceDetails);
            let orderCount = {'pricable.order_details':function(q){
                q.where('productable_type','products')
            }};
            relationShip.push(orderCount);
            let paymentCategory = {'pricable.payment_category':function(q){
                q.select('id','title','description');
                q.where('is_active',1)
            }};
            relationShip.push(paymentCategory);
            let payementType = {'pricable.payment_type':function(q){
                q.select('id','title');
                q.where('is_active',1)
            }};
            relationShip.push(payementType);
        }


        let product         =  Product.forge().orderBy('-id').where('product_type','event_ticket');

        if(fetchApprovedEvent){
            product = product.where('approved_status',1);
        }

        if(is_active){
            product = product.where('is_active',1);
        }

        if(category){

            category        = _.isArray(category) ? category : [category];

            product         = product.whereExists(function(){
                this.from('categories')
                this.innerJoin('category_product', 'categories.id', 'category_product.category_id');
                this.whereRaw('products.id = category_product.product_id');
                this.whereIn('category_id',category);
            });
        }

        if(speaker_id){
            speaker_id        = _.isArray(speaker_id) ? speaker_id : [speaker_id];

            product           = product.whereExists(function(){
                this.from('event_speakers')
                this.innerJoin('category_product_speakers','event_speakers.id','category_product_speakers.event_speaker_id');
                this.whereRaw('products.id = category_product_speakers.product_id');
                this.whereIn('event_speakers.id',speaker_id)
            });
        }

        if(country_id){
            country_id        = _.isArray(country_id) ? country_id : [country_id];

            product           = product.whereExists(function(){
                this.from('countries')
                this.innerJoin('product_events', 'countries.id', 'product_events.country_id');
                this.whereRaw('products.id = product_events.product_id');
                this.whereIn('country_id',country_id);
            });
        }
        if(fetchComingSoon){
            product = product
            .select('products.*')
            .query(function(qb){
                qb.leftJoin('product_events as pe', 'pe.product_id', 'products.id')
                qb.whereRaw(`pe.start_date > '${moment().format('YYYY-MM-DD')}'`);
            })
        }

        if(fetchOnlySxl){
             product = product
            .select('products.*')
            .query(function(qb){
                qb.innerJoin('product_prices','product_prices.pricable_id','products.id')
                qb.whereRaw(`product_prices.pricable_type = 'products' and product_prices.payment_type_id = 2 and product_prices.usd_price = 0.00`)
                qb.groupBy('products.id')
            })
        }
        if(fetchOnlyUSD){
             product = product
            .select('products.*')
            .query(function(qb){
                qb.innerJoin('product_prices','product_prices.pricable_id','products.id')
                qb.whereRaw(`product_prices.pricable_type = 'products' and product_prices.payment_type_id = 1 and product_prices.sxl_price = 0.00`)
                qb.groupBy('products.id')
            })
        }
        if(fetchUSDSXL){
            product = product
           .select('products.*')
           .query(function(qb){
               qb.innerJoin('product_prices','product_prices.pricable_id','products.id')
               qb.whereRaw(`product_prices.pricable_type = 'products' and product_prices.payment_type_id = 3`)
               qb.groupBy('products.id')
           })
       }
        if(fetchPastEvent){
            product = product
            .select('products.*')
            .query(function(qb){
                qb.leftJoin('product_events as pe1', 'pe1.product_id', 'products.id')
                qb.whereRaw(`pe1.end_date < '${moment().format('YYYY-MM-DD')}'`);
            })
        }
        if(dateFilter){
            product = product
            .query(function(q) {
                q.leftJoin('product_events','product_events.product_id','products.id')

                if(orderBy === false){
                    q.orderBy(`product_events.start_date`,'DESC')
                }
                if(orderBy){
                    switch(orderBy) {
                        case 'title':
                            q.orderBy('products.title','ASC')
                        break;
                        case '-id':
                            q.orderBy('products.id','DESC')
                        break;
                        default:
                            q.orderBy(`product_events.start_date`,'DESC')
                    }
                }
            })
        }

        if(user_id){
            product = product.where('user_id',user_id);
        }

        if(is_publish){
            product = product.where('status','publish');
        }

        if(is_delete){
            product = product.where('is_delete',0);
        }

        if(is_featured){
            product = product
            .select('products.*')
            .query(function(qb){
                qb.leftJoin('product_events as pe2', 'pe2.product_id', 'products.id')
                qb.whereRaw(`products.is_featured = 1 and pe2.end_date >= '${moment().format('YYYY-MM-DD')}'`);
            })
        }

        if(fetchfastSelling){
            product = product.where('is_fast_selling',1);
        }
        if(string){
            product = product.where(function () {
                this.where('title', 'like', `%${string}%`)
                    .orWhere('slug', 'like', `%${string}%`)
                    .orWhere('short_description', 'like', `%${string}%`)
                    .orWhere('description', 'like', `%${string}%`)
            })
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign({pageSize:limit,page:page},
                {withRelated: relationShip}
            );
            product = product.fetchPage(relation_params);
        }
        else
        {
            product = product.fetchAll(Object.assign(
                {withRelated:relationShip})
            );
        }

        product.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){

        let formData        = req.body;
        let application     = Config('application');
        let validationRules = {

            user_id             :   'required|integer',
            title               :   'required|string|maxLength:255|unique:products',
            description         :   'string',
            short_description   :   'string|maxLength:250',
            currency            :   'required|maxLength:4',
            product_type        :   `in:${application.product_type.join(',')}`,
            status              :   `in:${application.product_status.join(',')}`,
            categories          :   'required',
            speakers            :    'required',
            address             :   'required',
            country_id          :   'required|integer',
            state_id            :   'required|integer',
            city_id             :   'required|integer',
            start_date          :   'required|dateFormat:YYYY-MM-DD',
            end_date            :   'required|dateFormat:YYYY-MM-DD',
            post_code           :   'required'
            //start_time          :   'required|timeFormate:H:m',
            //end_time            :   'required|timeFormate:H:m'
        }

        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before create event ticket.'));
        }
        // if(await User.where('id',formData.user_id).where('is_kyc',1).count() === 0){
        //     return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        // }

        let validation = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        let product_data = {
            user_id             : formData.user_id,
            title               : formData.title,
            slug                : await generateSlug(Product,formData.title),
            description         : formData.description,
            short_description   : formData.short_description,
            currency            : formData.currency,
            product_type        : formData.product_type,
            status              : formData.status,
            is_featured         : _.toInteger(formData.is_featured == 1 ) ? _.toInteger(formData.is_featured) : 0,
            meta_description    : formData.meta_description,
            meta_keywords       : formData.meta_keywords,
        }

        let save_data;
        let lastInsertProductId;
        new Product().save(product_data)
        .then((product)=>{
            save_data = product
            lastInsertProductId = product.get('id');
            return product.get('id');
        })
        .then((productId)=>{

            let event_data = {
                product_id            : productId,
                address               : formData.address,
                country_id            : formData.country_id,
                state_id              : formData.state_id,
                city_id               : formData.city_id,
                post_code             : formData.post_code,
                start_date            : formData.start_date,
                end_date              : formData.end_date,
                banner_image          : formData.banner_image,
                type                  : formData.type,
                unique_event_id       : `${application.event_unique_id}-${moment().format('YYYY')}-${productId}`
                //start_time      : formData.start_time,
                //end_time        : formData.end_time
            }
           return new Event().save(event_data)
        })
        .then((productEventSave)=>{
            let categories = _.isArray(formData.categories) ? formData.categories : [formData.categories];
            return save_data.categories().attach(categories);
        })
        .then((productEventCategory)=>{
            let speakers = _.isArray(formData.speakers) ? formData.speakers : [formData.speakers];
            return save_data.event_speakers().attach(speakers);
        })
        .then((productEventcategory)=>{
            if(formData.images.length > 0) {

                Resizer.setSize(application.product_image_ratio)
                .setImageKey('original')
                .setAppends({imagable_type:'products','imagable_id':lastInsertProductId})
                .setDataObject(formData.images)
                .exec()
                .then((response)=>{
                    new Images().batchInsert(response)
                    .then((responseProductImage)=>{

                        return res.status(200).json(res.fnSuccess(save_data));

                    })
                    .catch((err)=>{
                        return res.status(400).json(res.fnError(err));
                    });
                })
                .catch((err)=>{
                    return res.status(400).json(res.fnError(err));
                })
            }
            else
            {
                return res.status(200).json(res.fnSuccess(save_data));
            }
        })
        .catch((err)=>{
            return res.status(400).json(res.fnError(err));
        })
    },

    show:function(req, res,next){

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        let relationShip    = [];

        let offers          = _.toBoolean(req.query.offers);
        let categories      = _.toBoolean(req.query.categories);
        let images          = _.toBoolean(req.query.images);
        let user            = _.toBoolean(req.query.user);
        let event           = _.toBoolean(req.query.event);
        let eventCountry    = _.toBoolean(req.query.event_country);
        let eventState      = _.toBoolean(req.query.event_state);
        let eventCity       = _.toBoolean(req.query.event_city);
        let userProfile     = _.toBoolean(req.query.profile);
        let reviewCount     = _.toBoolean(req.query.review_count);
        let fetch_price     = _.toBoolean(req.query.fetch_price);
        let fetchSpeaker    = _.toBoolean(req.query.event_speaker);
        let fetchApprovedEvent        = _.toBoolean(req.query.isApproved);

        let productDetail         = Product;
        // productDetail = productDetail.where('status','publish');

        if(offers){
            relationShip.push('offers');
        }
        if(categories){
            let eventCategory = {'categories':function(q){
                q.select('categories.*')
                q.where('categories.is_active',1)
                q.where('categories.type','events')
            }}
            relationShip.push(eventCategory);
        }
        if(images){
        	let eventTicketImages = {'images':function(q){
                q.select('id','imagable_type','imagable_id','thumbnail','imagable_type','small','banner','large','original');
                q.where('imagable_type','products')
                q.orderBy('id','DESC')
            }};
            relationShip.push(eventTicketImages);
            //relationShip.push('images');
        }
        if(user){
            relationShip.push('user');
        }
        if(event){
            relationShip.push('event');
        }
        if(eventCountry){
            relationShip.push('event.country');
        }
        if(eventState){
            relationShip.push('event.state');
        }
        if(eventCity){
            relationShip.push('event.city');
        }
        if(userProfile){
            relationShip.push('user.profile');
        }
        if(reviewCount) {
            let reviewMap = {'reviews':function(q){
                q.select('id','reviewable_id');
            }};
            relationShip.push(reviewMap);
        }
        if(fetchSpeaker){
            relationShip.push('event_speakers');
        }

        if(fetch_price){
            let priceDetails = {'pricable':function(q){
                q.select('pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity','id as product_price_id');
                q.where('pricable_type','products')
            }};
            relationShip.push(priceDetails);
            let paymentCategory = {'pricable.payment_category':function(q){
                q.select('id','title','description');
                q.where('is_active',1)
            }};
            relationShip.push(paymentCategory);
            let payementType = {'pricable.payment_type':function(q){
                q.select('id','title');
                q.where('is_active',1)
            }};
            relationShip.push(payementType);
        }
        if(fetchApprovedEvent){
            productDetail   = productDetail.where('approved_status',1);
        }

        productDetail.where(findBy,findFor).fetch(
            {withRelated:relationShip}
        )
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){
        let formData        = req.body;
        let application     = Config('application');

        let product_id      = req.params.id;

        let validationRules  = {
            user_id             :   'required|integer',
            title               :   'required|string|maxLength:255',
            description         :   'string',
            short_description   :   'string|maxLength:250',
            currency            :   'required|maxLength:4',
            product_type        :   `in:${application.product_type.join(',')}`,
            status              :   `in:${application.product_status.join(',')}`,
            categories          :   'required',
            speakers            :   'required',
            country_id          :   'required|integer',
            state_id            :   'required|integer',
            city_id             :   'required|integer' ,
            is_featured         :   'boolean',
            start_date          :   'required|dateFormat:YYYY-MM-DD',
            end_date            :   'required|dateFormat:YYYY-MM-DD',
            post_code           :   'required'
            //start_time          :   'required|timeFormate:H:m',
            //end_time            :   'required|timeFormate:H:m'
        }

        let validation  = new Validator(formData,validationRules);

        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        // if(await User.where('id',formData.user_id).where('is_kyc',1).count() === 0){
        //     return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        // }



        let product_data = {
            user_id             : formData.user_id,
            title               : formData.title,
            description         : formData.description,
            short_description   : formData.short_description,
            currency            : formData.currency,
            product_type        : formData.product_type,
            status              : formData.status,
            is_featured         : _.toInteger(formData.is_featured == 1 ) ? _.toInteger(formData.is_featured) : 0,
            meta_description    : formData.meta_description,
            meta_keywords       : formData.meta_keywords
        }
        let saveData = null;

        if(await OrderDetails.where('productable_id',product_id).where('productable_type','products').count() > 0){
            return res.status(400).json(res.fnError(`Someone has already purchased this ticket.So you cannot edit this ticket anymore`));
        }

        if(await Product.where('id',product_id).where('user_id',formData.logged_in_user_id).count() === 0){
            return res.status(400).json(res.fnError(`You don't have a permission to edit this event!`));
        }

        Product.where('id',product_id).save(product_data,{patch:true})
        .then((product)=>{
            return Product.where('id',product_id).fetch();
        })
        .then((product)=>{
            if(formData.categories){
                let categories = _.isArray(formData.categories) ? formData.categories : [formData.categories];
                product.categories().detach();
                product.categories().attach(categories);
            }
            return product;
        })
        .then((product)=>{
            if(formData.speakers){
                let speakers = _.isArray(formData.speakers) ? formData.speakers : [formData.speakers];
                product.event_speakers().detach();
                product.event_speakers().attach(speakers);
            }
            return product;
        })
        .then((product)=>{
            let event_data = {
                product_id            : product_id,
                address               : formData.address,
                country_id            : formData.country_id,
                state_id              : formData.state_id,
                city_id               : formData.city_id,
                post_code             : formData.post_code,
                start_date            : formData.start_date,
                end_date              : formData.end_date,
                banner_image          : formData.banner_image,
                type                  : formData.type,
                //start_time      : formData.start_time,
                //end_time        : formData.end_time
            };
            Event.where('product_id',product_id).save(event_data,{patch:true})
            return product;
        })
        .then((product)=>{
            if(formData.images.length > 0) {
               Resizer.setSize(application.product_image_ratio)
                .setImageKey('original')
                .setAppends({imagable_type:'products',imagable_id:product_id})
                .setDataObject(formData.images)
                .exec()
                .then((response)=>{
                    Images.where('imagable_id',product_id).where('imagable_type','products').destroy()
                    new Images().batchInsert(response);
                })
            }
            return res.status(200).json(res.fnSuccess(product));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    destroy:function(req,res,next){
        let Bookshelf      = Config('database');
        let product_id     = req.params.id;
        let image          = _.toBoolean(req.query.image);
        let image_id       = _.toInteger(req.query.image_id);

        if(image){
            Bookshelf.knex('images')
                .where('id', image_id)
                .del()
                .then((response)=>{
                    return res.status(200).json(res.fnSuccess(response));
                })
                .catch((errors)=>{
                    return res.status(400).json(res.fnError(errors));
                })
        }
        else
        {

            Product.where('id',product_id).destroy({required:false}).then((response)=>{
                let condition = {
                    imagable_type : 'product_events',
                    imagable_id   : product_id
                };
                Images.where(condition).destroy();
                return res.status(200).json(res.fnSuccess(response));
            })
            .catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
        }
    }
}

module.exports = EventController;