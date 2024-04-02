const User              = Model('User');
const Role              = Model('Role');
const ProviderAccount   = Model('ProviderAccount');
const Validator         = Helper('validator');
const bcrypt            = require('bcryptjs');
const PermissionMap     = Config('authentication');
const EmailVerification = Mail('EmailVerification');
const moment = require('moment');

const UserController = {

    index: async function (req, res, next) {

        let has_pagination              = _.toBoolean(req.query.pagination);
        let fetch_role                  = _.toBoolean(req.query.roles) ? 'roles' : {};
        let limit                       = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page                        = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;
        let user_role                   = req.query.role;
        let fetchProfile                = _.toBoolean(req.query.profile) ? 'profile' : {};
        let is_active                   = _.toBoolean(req.query.is_active);
        let rating                      = _.toBoolean(req.query.rating);
        let user                        = User.forge().orderBy('-id');
        let relationShip                = [fetchProfile, fetch_role];
        let string                      = req.query.string || false;
        let course_count                = req.query.course_count || false;

        if(rating){
            let courseMap = {'ratings':function(q){
                q.select('id','rating','created_by');
            }};

            relationShip.push(courseMap);
        };
        if(string){
            user = user.where(function () {
                this.where('user_name', 'like', `%${string}%`)
                    .orWhere('mobile_no', 'like', `%${string}%`)
            })
        }

        if(is_active){
            user = user.where('users.is_active',is_active);
        }
        if(course_count){

            user = user
                .select('users.*')
                .query(function(qb){
                    qb.count('courses.created_by as count')
                    qb.innerJoin('courses', 'courses.created_by', 'users.id')
                    qb.whereRaw('courses.approved_status =  1' )
                    qb.whereRaw('courses.status =  "publish"' )
                    qb.whereRaw('courses.is_active =  1' )
                    qb.whereRaw('courses.is_delete =  0' )
                    qb.groupBy('users.id')
                })
        }

        if (user_role) {

            await Role.where('name', user_role).fetch({
                withRelated: {
                    'users': function (qb) {
                        qb.select('user_name')
                    }
                },
                columns: ['id']
            }).then(async (role) => {
                let users = role.related('users').toJSON();
                user = user.whereIn('users.id', users.map(v => v._pivot_user_id));
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
        }

        if (has_pagination) {
            let relation_params = Object.assign(
                { pageSize: limit, page: page },
                { withRelated: relationShip }
            );
            user = user.fetchPage(relation_params);
        } else {

            user = user.fetchAll(Object.assign(
                { withRelated: relationShip }));
        }

        user.then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });

    },

    store: async function (req, res, next) {

        let formData = req.body;
        let roleMap = _.pull(PermissionMap.role_structure, PermissionMap.single_user);
        let save_data, role_id; is_user_exists = false;


        let validation = new Validator(formData, {
            user_name: 'required|email|maxLength:250|uniqueWithout:users,provider,provider_id',
            email_link: 'requiredWithout:provider,provider_id|url',
            password: 'requiredWithout:provider,provider_id|string|minLength:6|maxLength:250',
            phone_code: 'requiredWithout:provider,provider_id|string|maxLength:5',
            avatar: 'string|maxLength:250',
            mobile_no: 'integer|maxLength:20',
            is_active: 'boolean',
            is_block: 'boolean',
            role: `required|in:${roleMap.join(',')}`,
            provider: 'requiredWith:provider_id',
            provider_id: 'requiredWith:provider'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let token = {
            user_name: formData.user_name,
            expired_on: new Date().addDays(5).toTime()
        }

        let user_data = _.pickBy({
            user_name: formData.user_name,
            password: formData.password ? bcrypt.hashSync(formData.password, 10) : '',
            avatar: formData.avatar,
            phone_code: formData.phone_code,
            mobile_no: formData.mobile_no,
            token: encrypt(token).trim(),
            is_active: (formData.provider && formData.provider_id) ? 1 : 0,
            is_block: formData.is_block,
        }, _.identity)


        await Role.where('name', formData.role).fetch({ columns: ['id'] }).then((role) => {
            role_id = role.get('id');
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });

        await User.where('user_name', formData.user_name).fetch({ withRelated: 'profile' }).then((user) => {
            if (user) {
                is_user_exists = true
                return user.save(_.omit(user_data, ['user_name', 'password', 'token']), { patch: true });
            } else {
                return new User(user_data).save();
            }
        }).then((user) => {
            save_data = user;
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });

        if (is_user_exists == false) {
            await User.where('id', save_data.get('id')).fetch().then((user) => {
               //  user.roles().detach();
                user.roles().attach(role_id);
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            })
        }


        if (formData.provider && formData.provider_id) {

            let provider_data = {
                provider: formData.provider,
                provider_id: formData.provider_id,
                user_id: save_data.get('id')
            }

            ProviderAccount.where(provider_data).fetch().then((provider) => {
                if (provider) {
                    return provider.save(_.omit(provider_data, 'user_id'), { patch: true });
                } else {
                    return new ProviderAccount(provider_data).save();
                }
            }).then((provider_account) => {

                let user_id = save_data.get('id');

                new User().getAuthorizeToken(user_id).then((data) => {
                    return res.status(200).json(data);
                }).catch((e) => {
                    return res.status(400).json(res.fnError(errors));
                })
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            })

        } else {
            EmailVerification(save_data, formData.role, formData.email_link).then((response) => {
                dd(response)
                return res.status(200).json(res.fnSuccess(save_data));
            }).catch((errors) => {
                dd(errors)
                return res.status(401).json(res.fnError(errors, 'Something wrong please try again after some time.'));
            })
        }
    },

    show: function (req, res, next) {

        let fetchProfile   = _.toBoolean(req.query.profile) ? 'profile' : {};
        let rating         = _.toBoolean(req.query.rating);
        let courseCount    = _.toBoolean(req.query.course_count);
        let reviewCount    = _.toBoolean(req.query.review_count);
        let fetchCourses   = _.toBoolean(req.query.courses);
        let fetchProduct   = _.toBoolean(req.query.products);
        let fetchEvents    = _.toBoolean(req.query.events);
        let has_announcements   = _.toBoolean(req.query.announcements);
        let hasOffer            = _.toBoolean(req.query.offer);
        let fetchWishlist         = _.toBoolean(req.query.whislist);
        let userId               = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let fetch_price          = _.toBoolean(req.query.fetch_price);

        let relationShip   = [fetchProfile,'roles'];

        if(has_announcements){
            relationShip.push('user_announcements');
        }

        if(rating){
            let ratingCount = {'ratings':function(q){
                q.select('id','rating','created_by');
            }};
            relationShip.push(ratingCount);
        };
        if(fetchProduct){
            let fetchProduct = {'products':function(q){
                q.select('id','title','slug','short_description','currency','status','user_id','rating');
                q.where('product_type','product');
                q.where('status','publish');
            }};
            relationShip.push(fetchProduct,'products.images');
        }
        if(fetchEvents){
            let fetchEvents = {'events':function(q){
                q.select('id','title','slug','short_description','currency','status','user_id','rating');
                q.where('product_type','event_ticket');
                q.where('status','publish');
            }};
            relationShip.push(fetchEvents,'events.images');
        }
        if(fetchCourses){
            let fetchCourses = {'courses':function(q){
                q.select('id','title','sub_title','primary_thought','currency','status','created_by','slug','rating');
                q.where('status','publish');
                q.where('approved_status',1);
                q.where('is_active',1);
                q.where('is_delete',0);
            }};
            relationShip.push(fetchCourses,'courses.images');

            if(hasOffer){
                let offerMap = {'courses.offer':function(q){
                    q.where('product_offers.is_expired',false);
                    q.whereRaw(`'${moment().format('YYYY-MM-DD')}' BETWEEN DATE(  product_offers.started_on ) AND DATE( product_offers.ended_on )`);
                }};
                relationShip.push(offerMap);
            }

            if(fetchWishlist){
                if(userId){
                    let whislistMap = {'courses.whislist':function(q){
                        q.select('id','wishlistable_type','wishlistable_id','user_id');
                        q.where('wishlistable_type','courses');
                        q.where('user_id',userId);
                    }
                };
                relationShip.push(whislistMap);
                }
            }
            if(fetch_price){
                let priceDetails = {'courses.pricable':function(q){
                    q.select('id','pricable_id','pricable_type','payment_type_id','payment_category_id','total_price','sxl_price','usd_price','quantity');
                    q.where('pricable_type','courses')
                }};
                relationShip.push(priceDetails);
                let paymentCategory = {'courses.pricable.payment_category':function(q){
                    q.select('id','title','description');
                    q.where('is_active',1)
                }};
                relationShip.push(paymentCategory);
                let payementType = {'courses.pricable.payment_type':function(q){
                    q.select('id','title');
                    q.where('is_active',1)
                }};
                relationShip.push(payementType);
            }
        }
        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        let user = User.where(findBy,findFor)
        if(courseCount){
            user.withCount('courses as course_count',function(qb){
                qb.where('courses.created_by',findFor),
                qb.where('status','publish')
                qb.where('approved_status',1)
                qb.where('is_active','1')
                qb.where('is_delete','0')
            })
        }
        if(reviewCount){
            user.withCount('reviews as review_count',function(qb){
                qb.where('reviews.user_id',findFor)

            })
        }
        user.fetch({withRelated:relationShip}).then((user)=>{
            return res.status(200).json(res.fnSuccess(user));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function (req, res, next) {

        let formData = req.body;
        let user_id = req.params.id;
        let validation = new Validator(formData, {
            password: 'string|minLength:6|maxLength:250',
            avatar: 'string|maxLength:250',
            mobile_no: 'integer|maxLength:20',
            is_active: 'boolean',
            is_block: 'boolean',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let user_data = {
            avatar: formData.avatar,
            mobile_no: formData.mobile_no,
            is_active: formData.is_active,
            is_block: formData.is_block,
        };

        if (formData.password && formData.password != '') {
            user_data['password'] = bcrypt.hashSync(formData.password, 10);
        }

        User.where('id', user_id).save(user_data, { patch: true }).then((user) => {
            return res.status(200).json(res.fnSuccess(user));
        })
        .catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy: function (req, res, next) {

        let user_id = req.params.id;

        User.where('id', user_id).destroy({ require: false }).then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    }
}


module.exports = UserController;
