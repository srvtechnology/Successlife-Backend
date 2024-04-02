const Validator   = Helper('validator');
const Product     = Model('Product/Product');
const Images      = Model('Images');
const Resizer     = Helper('resizer');
const Profile     = Model('Profile');
const User        = Model('User');
const commonFunction = Helper('common');

const ProductController = {

    index:function(req, res,next){

        let relationShip    = [];
        let orderbyColumn   = ['id','price','created_at','rating'];
        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let user_id         = _.toInteger(req.query.user_id);
        let order_by        = _.toBoolean(req.query.order_by) ? req.query.order_by         : '-id';
        let is_publish      = _.toBoolean(req.query.is_publish);
        let category        = _.toBoolean(req.query.category) ? req.query.category : '';
        let offers          = _.toBoolean(req.query.offers);
        let categories      = _.toBoolean(req.query.categories);
        let images          = _.toBoolean(req.query.images);
        let user            = _.toBoolean(req.query.user);
        let userProfile     = _.toBoolean(req.query.profile);
        let reviewCount     = _.toBoolean(req.query.review_count);
        let fetch_price     = _.toBoolean(req.query.fetch_price);
        let fetchApprovedProduct        = _.toBoolean(req.query.isApproved);

        let product         = Product.forge().where('product_type','product');


        if(fetchApprovedProduct){
            product = product.where('approved_status',1);
        }

        if(offers){
            relationShip.push('offers');
        }
        if(categories){
            relationShip.push('categories');
        }
        if(images){
            relationShip.push('images');
        }
        if(user){
            relationShip.push('user');
        }
        if(userProfile){
            relationShip.push('user.profile');
        }

        if(fetch_price){
            let priceDetails = {'pricable':function(q){
                q.select('pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity');
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
        if(category){

            category        = _.isArray(category) ? category : [category];

            product         = product.whereExists(function(){
                this.from('categories')
                this.innerJoin('category_product', 'categories.id', 'category_product.category_id');
                this.whereRaw('products.id = category_product.product_id');
                this.whereIn('category_id',category);
            });
        }

        if(order_by && _.contain(orderbyColumn,_.lTrim(order_by,['-','+'])) ){
            product =  product.orderBy(order_by);
        }

        if(user_id){
            product = product.where('user_id',user_id);
        }

        if(is_publish){
            product = product.where('status','publish');
        }

        if(reviewCount) {
            let reviewMap = {'reviews':function(q){
                q.select('id','reviewable_id');
            }};
            relationShip.push(reviewMap);
        }

        if(has_pagination){
            let relation_params = Object.assign(
                {pageSize:limit,page:page},
                {withRelated:relationShip}
            );
            product = product.fetchPage(relation_params);
        }
        else
        {
            product = product.fetchAll(Object.assign(
                    {withRelated:relationShip}
                )
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
            description         :   'required|string',
            short_description   :   'required|string|maxLength:250',
            //quantity            :   'required|integer',
            //price               :   'required|decimal',
            //discount            :   'required|decimal|digitsBetween:0,100',
            currency            :   'required|maxLength:4',
            product_type        :   `in:${application.product_type.join(',')}`,
            status              :   `in:${application.product_status.join(',')}`,
            categories          :   'required'
        }

        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before create product.'));
        }

        // if(await User.where('id',formData.user_id).where('is_kyc',1).count() === 0){
        //     return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        // }

        let validation = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let product_data = _.pickBy({
            user_id             : formData.user_id,
            title               : formData.title,
            slug                : await generateSlug(Product,formData.title),
            description         : formData.description,
            short_description   : formData.short_description,
            //quantity            : formData.quantity,
            //discount            : formData.discount,
            //price               : formData.price,
            currency            : formData.currency,
            product_type        : formData.product_type,
            status              : formData.status
        },_.identity);

        let save_data;
        let lastInsertProductId;
        new Product().save(product_data).then((product)=>{
            save_data = product
            lastInsertProductId = product.get('id');

            let categories = _.isArray(formData.categories) ? formData.categories : [formData.categories];
            save_data.categories().attach(categories);

            if(formData.images.length > 0){
                Resizer.setSize(application.product_image_ratio)
                .setImageKey('original')
                .setAppends({imagable_type:'products','imagable_id':lastInsertProductId})
                .setDataObject(formData.images)
                .exec()
                .then((response)=>{
                    new Images().batchInsert(response)
                    .then((responseProductImage)=>{

                        /*response sent*/

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
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    show:function(req, res,next){

        let relationShip    = [];
        let offers          = _.toBoolean(req.query.offers);
        let categories      = _.toBoolean(req.query.categories);
        let images          = _.toBoolean(req.query.images);
        let user            = _.toBoolean(req.query.user);
        let userProfile     = _.toBoolean(req.query.profile);
        let fetch_price     = _.toBoolean(req.query.fetch_price);

        if(offers){
            relationShip.push('offers');
        }
        if(categories){
            relationShip.push('categories');
        }
        if(images){
            relationShip.push('images');
        }
        if(user){
            relationShip.push('user');
        }
        if(userProfile){
            relationShip.push('user.profile');
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

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        Product.where(findBy,findFor).fetch({withRelated:relationShip}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){
        let formData        = req.body;
        let application     = Config('application');

        let product_id      = req.params.id;

        if(await commonFunction.productEditOrderStatusCheck(product_id) === true){
            return res.status(400).json(res.fnError(`Someone has already purchased this product`));
        }

        let validationRules  = {
            user_id             :   'required|integer',
            title               :   'required|string|maxLength:255',
            description         :   'string',
            short_description   :   'string|maxLength:250',
            //quantity            :   'required|integer',
            //price               :   'required|decimal',
            //discount            :   'required|decimal|digitsBetween:0,100',
            currency            :   'required|maxLength:4',
            product_type        :   `in:${application.product_type.join(',')}`,
            status              :   `in:${application.product_status.join(',')}`,
            categories          :   'required'
        }

        // if(await User.where('id',formData.user_id).where('is_kyc',1).count() === 0){
        //     return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        // }

        let validation  = new Validator(formData,validationRules);

        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let product_data = _.pickBy({
            user_id             : formData.user_id,
            title               : formData.title,
            description         : formData.description,
            short_description   : formData.short_description,
            //quantity            : formData.quantity,
            //discount            : formData.discount,
            //price               : formData.price,
            currency            : formData.currency,
            product_type        : formData.product_type,
            status              : formData.status
        },_.identity);

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

            if(formData.images.length > 0){

                Resizer.setSize(application.product_image_ratio)
                .setImageKey('original')
                .setAppends({imagable_type:'products',imagable_id:product_id})
                .setDataObject(formData.images)
                .exec()
                .then((response)=>{
                    new Images().createOrUpdate(response,['imagable_id','thumbnail','banner','original'])
                    .then((responseProductImage)=>{
                        /*response sent*/

                        return res.status(200).json(res.fnSuccess(product));

                    })
                    .catch((err)=>{
                        return res.status(400).json(res.fnError(err));
                    });
                })
                .catch((err)=>{
                    return res.status(400).json(res.fnError(err));
                })
            }
            else{
                return res.status(200).json(res.fnSuccess(product));
            }
        })
        .catch((err)=>{
            return res.status(400).json(res.fnError(err));
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
            Product.where('id',product_id).destroy({required:false})
                .then((response)=>{
                    let condition = {
                        imagable_type : 'products',
                        imagable_id   : product_id
                    };
                Images.where(condition).destroy();
                return res.status(200).json(res.fnSuccess(response));
            })
            .catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
        }
    },
}

module.exports = ProductController;