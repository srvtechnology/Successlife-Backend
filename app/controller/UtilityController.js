const User = Model('User');
const Validator = Helper('validator');
const Country = Model('Location/Country');
const State = Model('Location/State');
const City = Model('Location/City');
const Course = Model('Course/Course');
const Product = Model('Product/Product');
const Order = Model('Order/Orders');
const OrderAddress = Model('Order/OrderAddress');
const OrderDetails = Model('Order/OrderDetails');
const UserCourse = Model('Course/UserCourse');
const CourseLecture = Model('Course/CourseLecture');
const UserCourseProgress = Model('Course/UserCourseProgress');
const moment = require('moment');
const Notification = Model('Notification');
const CourseCoupon = Model('Course/CourseCoupon');
const Category = Model('Category');
const notificationAlert = Helper('notification-alert');
const commonFunction = Helper('common');
const ResellerProduct = Model('./Reseller/ResellerProduct');
const Profile = Model('Profile');
const PaymentType = Model('PaymentType');
const ProductPrice = Model('ProductPrice');
const mailNotification = Helper('mail-notification');
const Bookshelf = Config('database');
const Event = Model('Product/Event');
const Setting       = Model('Setting');
const AttendeeInformation       = Model('AttendeeInformation');
const generateBarAndQrCode = Helper('generate-bar-and-qr-code.js');

const UtilityController = {

    hasEmail: async function (req, res, next) {
        let formData = req.body;

        var validation = new Validator(formData, {
            email: 'required|email|maxLength:250',
        })

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        User.where('email', formData.email).count().then((user) => {
            if (user >= 1) {
                return res.status(200).json({ status: 'success', has_email: true });
            } else {
                return res.status(200).json({ status: 'success', has_email: false });
            }
        }).catch((response) => {
            return res.status(400).json({ status: 'error', data: response });
        });
    },

    applicationConfig: function (req, res, next) {

        let section = req.query.section;
        let application = Config('application');

        if (section) {
            application = application[section];
        }

        return res.status(200).json(res.fnSuccess(application));
    },

    getCountries: function (req, res, next) {

        let column = req.query.column ? (
            _.isArray(req.query.column) ? req.query.column : [req.query.column]
        ) : ['*'];

        let accept_columns = [
            'id', 'name', 'code', 'phone_code', 'flag'
        ];

        let req_column = _.intersection(accept_columns, column);

        Country.fetchAll({ columns: req_column }).then((countries) => {
            return res.status(200).json(res.fnSuccess(countries));
        }).catch((errors) => {
            return res.status(401).json(res.fnError(errors));
        })
    },

    getStatesByCountryId: function (req, res, next) {

        let country_id = req.params.country_id;

        State.where('country_id', country_id).fetchAll().then((states) => {
            return res.status(200).json(res.fnSuccess(states));
        }).catch((errors) => {
            return res.status(401).json(res.fnError(errors));
        })
    },

    getCitiesByStateId: function (req, res, next) {

        let state_id = req.params.state_id;

        City.where('state_id', state_id).fetchAll().then((cities) => {
            return res.status(200).json(res.fnSuccess(cities));
        }).catch((errors) => {
            return res.status(401).json(res.fnError(errors));
        })
    },

    getRelatedCourses: function (req, res, next) {

        let relationShip = [];
        let orderbyColumn = ['id', 'price', 'created_at'];
        let limit = _.toBoolean(req.query.limit);
        let order_by = _.toBoolean(req.query.order_by) ? req.query.order_by : '-id';
        let categories = _.toBoolean(req.query.categories);
        let is_publish = _.toBoolean(req.query.is_publish);
        let has_user = _.toBoolean(req.query.user);
        let has_profile = _.toBoolean(req.query.profile);
        let reviewCount = _.toBoolean(req.query.review_count);
        let has_offer = _.toBoolean(req.query.offer);
        let fetch_price = _.toBoolean(req.query.fetch_price);

        let course = Course.forge();
        course = course.where('is_active', 1).where('is_delete', 0);
        if (order_by && _.contain(orderbyColumn, _.lTrim(order_by, ['-', '+']))) {
            course = course.orderBy(order_by);
        }

        if (has_user) {
            relationShip.push('user');
            if (has_profile) {
                relationShip.push('user.profile');
            }
        }
        relationShip.push('images');

        if (has_offer) {
            let offerMap = {
                'offer': function (q) {
                    q.where('is_expired', false);
                    q.whereRaw(`'${moment().format('YYYY-MM-DD')}' BETWEEN DATE(  product_offers.started_on ) AND DATE( product_offers.ended_on )`);
                }
            };
            relationShip.push(offerMap);
        }

        if (limit) {
            course = course.limit(_.toInteger(req.query.limit));
        }

        if (reviewCount) {
            let reviewMap = {
                'reviews': function (q) {
                    q.select('id', 'reviewable_id');
                }
            };
            relationShip.push(reviewMap);
        }

        if (categories) {
            categories = _.isArray(req.query.categories) ? req.query.categories : [req.query.categories];
            course = course.whereExists(function () {
                this.from('categories')
                this.innerJoin('category_course', 'categories.id', 'category_course.category_id');
                this.whereRaw('courses.id = category_course.course_id');
                this.whereIn('category_id', categories);

                if (is_publish) {
                    this.where('courses.status', 'publish');
                }
            });
        }

        if (fetch_price) {
            let priceDetails = {
                'pricable': function (q) {
                    q.select('id', 'pricable_id', 'pricable_type', 'payment_type_id', 'payment_category_id', 'total_price', 'sxl_price', 'usd_price', 'quantity');
                    q.where('pricable_type', 'courses')
                }
            };
            relationShip.push(priceDetails);
            let paymentCategory = {
                'pricable.payment_category': function (q) {
                    q.select('id', 'title', 'description');
                    q.where('is_active', 1)
                }
            };
            relationShip.push(paymentCategory);
            let payementType = {
                'pricable.payment_type': function (q) {
                    q.select('id', 'title');
                    q.where('is_active', 1)
                }
            };
            relationShip.push(payementType);
        }

        course = course.fetchAll({ withRelated: relationShip }).then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        })
    },

    removeFileFromS3: function (req, res, next) {

        let fileKey = _.toBoolean(req.query.key) ? req.query.key.toString() : false;

        if (!fileKey) {
            return res.status(400).json(res.fnError('S3 bucket file key is missing.'));
        }

        const s3BasePath = `https://s3-${getEnv('AWS_REGION')}.amazonaws.com`;
        const AWS = require('aws-sdk');
        const Bucket = getEnv('AWS_BUCKET');
        const s3 = new AWS.S3({
            accessKeyId: getEnv('AWS_ACCESS_KEY'),
            secretAccessKey: getEnv('AWS_SECRATE_KEY'),
            region: getEnv('AWS_REGION'),
            ACL: getEnv('AWS_ACL'),
        });

        if (_.contain(fileKey, s3BasePath)) {
            fileKey = _.replace(fileKey, `${s3BasePath}/${Bucket}/`, '');
        }

        const params = {
            Bucket: Bucket,
            Key: fileKey
        }
        s3.deleteObject(params).promise().then((response) => {
            return res.status(200).json(res.fnSuccess('file removed successfully.'));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        })
    },

    courseStatusUpdate: async function (req, res, next) {

        let formData = req.body;
        let validation = new Validator(formData, {
            status: `required|in:${_.join(getConfig('application.course_status'), ',')}`,
            course_id: 'required|integer|inDatabase:courses,id'
        });

        if (await OrderDetails.where('productable_id', formData.course_id).where('productable_type', 'courses').count() > 0) {
            return res.status(400).json(res.fnError(`Someone has already purchased this course.So you cannot edit this courses anymore`));
        }

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if (await User.where('id', formData.user_id).where('is_kyc', 1).count() === 0) {
            return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        }

        Course.where('id', formData.course_id)
            .withCount('course_modules as module_count')
            .withCount('course_modules.course_lectures as lecture_count')
            .fetch().then((course) => {

                if (_.isEmpty(course.get('description'))) {
                    return res.status(400).json(res.fnError(`Please add some description in ${course.get('title')} course`));
                }

                if (_.isEmpty(course.get('primary_thought'))) {
                    return res.status(400).json(res.fnError(`Please add some primary thought in ${course.get('title')} course`));
                }

                if (_.isEmpty(course.get('promotional_video'))) {
                    return res.status(400).json(res.fnError(`Please add some promotional video in ${course.get('title')} course`));
                }

                if (course.get('module_count') == 0) {
                    return res.status(400).json(res.fnError(`Please add some course module in ${course.get('title')} course`));
                }

                if (course.get('lecture_count') == 0) {
                    return res.status(400).json(res.fnError(`Please add some lecture on each module of ${course.get('title')} course`));
                }

                let coruseData = {
                    status: formData.status,
                    approved_status: 0
                }
                return course.save(coruseData, { patch: true });

            }).then((course) => {
                let sendData = {
                    id: course.get('id'),
                    status: course.get('status'),
                    updated_at: course.get('updated_at')
                }
                return res.status(200).json(res.fnSuccess(sendData));
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
    },

    productSearch: async function (req, res, next) {

        let Product = Model('View/ProductSearch');
        let has_pagination = _.toBoolean(req.query.pagination);
        let limit = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;
        let string = req.query.string || false;
        let rating = req.query.rating || false;
        let price = req.query.price || false;
        let user = req.query.user || false;
        let duration = req.query.duration || false;
        let stander = req.query.stander || false;
        let category = req.query.category || false;

        let product = Product.forge().select(
            [
                'enitity_id',
                'enitity_type',
                'title',
                'slug',
                'sub_title',
                'rating',
                'duration',
                'user_full_name',
                'image',
                'user_id',
                'lecture_count',
                'category_name',
                'category_id',
                'stander_name',
                'speaker_name',
                'speaker_id',
                'product_type'
            ]
        )
            .orderBy('-created_at');
        if (string) {
            product.where(function () {
                this.where('title', 'like', `%${string}%`)
                    .orWhere('sub_title', 'like', `%${string}%`)
                    .orWhere('description', 'like', `%${string}%`)
                    .orWhere('category_name', 'like', `%${string}%`)
                    .orWhere('user_full_name', 'like', `%${string}%`)
            })
        }

        if (rating && _.contain(rating, ':')) {
            rating = _.chain(rating).split(':').filter().map(Number).sortBy().take(2).value();
            product.where(function () {
                this.whereBetween('rating', rating)
            })
        }

        // if (price && _.contain(price, ':')) {
        //     price = _.chain(price).split(':').filter().map(Number).sortBy().take(2).value();
        //     product.where(function () {
        //         this.whereBetween('price', price)
        //     })
        // }

        if (duration && _.contain(duration, ':')) {
            duration = _.chain(duration).split(':').filter().map(Number).sortBy().take(2).value();
            product.where(function () {
                this.whereBetween('duration', duration)
            })
        }

        if (user) {
            user = _.contain(user, ',') ? _.split(user, ',') : [user];
            product.where(function () {
                this.whereIn('user_id', user)
            })
        }

        if (category) {
            category = _.contain(category, ',') ? _.split(category, ',') : [category];

            product.where(function () {
                _.each(category, function (v) {
                    product.whereRaw(`FIND_IN_SET( ${v}, category_id)`);
                })
            })
        }

        if (stander) {
            stander = _.contain(stander, ',') ? _.split(stander, ',') : [stander];
            product.where(function () {
                this.whereIn('stander_id', stander)
            })
        }

        if (has_pagination) {
            product = product.fetchPage({ pageSize: limit, page: page });
        } else {
            product = product.fetchAll();
        }

        product.then((products) => {
            return res.status(200).json(res.fnSuccess(products));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },

    productAutoCompleteSearch: async function (req, res, next) {

        let Product = Model('View/ProductAutoCompleteSearch');
        let has_pagination = _.toBoolean(req.query.pagination);
        let limit = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;
        let string = req.query.string || false;

        let product = Product.forge().select(
            [
                'enitity_id',
                'enitity_type',
                'search_name'
            ]
        ).orderBy('-created_at');

        if (string) {
            product.where(function () {
                this.where('search_name', 'like', `%${string}%`)
            })

            if (has_pagination) {
                product = product.fetchPage({ pageSize: limit, page: page });
            } else {
                product = product.fetchAll();
            }

            product.then((products) => {
                return res.status(200).json(res.fnSuccess(products));
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
        }

    },

    updateProductStatus: async function (req, res, next) {
        let application = Config('application');

        let formData = req.body;

        let product_id = formData.id;

        let validationRules = {
            id: 'required|integer|inDatabase:products,id',
            status: `in:${application.product_status.join(',')}`,
        }

        if (await User.where('id', formData.user_id).where('is_kyc', 1).count() === 0) {
            return res.status(400).json(res.fnError('Please Complete your KYC first.'));
        }

        if (formData.status === 'publish') {
            if (await ProductPrice.where('pricable_id', formData.id).where('pricable_type', 'products').count() == 0) {
                return res.status(422).json(res.fnError('Product Price Section is mandatory'));
            }
        }

        if (await OrderDetails.where('productable_id', formData.id).where('productable_type', 'products').count() > 0) {
            return res.status(400).json(res.fnError(`Someone has already purchased this product.So you cannot edit this product anymore`));
        }

        let validation = new Validator(formData, validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let product_data = {
            status: formData.status,
            approved_status: 0
        }

        Product.where('id', product_id).save(product_data, { patch: true })
            .then((product) => {
                let data = Product.where('id', product_id).fetch();
                return res.status(200).json(res.fnSuccess(product_data));
            })
            .catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            })
    },
    updateFeaturedProduct: async function (req, res, next) {
        let formData = req.body;

        let product_id = formData.id;

        let validationRules = {
            id: 'required|integer|inDatabase:products,id',
            is_featured: 'boolean'
        }

        if (await Product.where('id', product_id).where('status', 'publish').count() == 0) {
            return res.status(422).json(res.fnError('You have to publish your product first!.'));
        }

        if (await Event.whereRaw(`product_id = ${product_id} and banner_image  IS NULL `).count() === 1) {
            return res.status(422).json(res.fnError('Banner Image is mandatory.'));
        }

        let validation = new Validator(formData, validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let product_data = {
            is_featured: formData.is_featured
        }
        Product.where('id', product_id).save(product_data, { patch: true })
            .then((product) => {
                let data = Product.where('id', product_id).fetch();
                return res.status(200).json(res.fnSuccess(product));
            })
            .catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            })
    },

    changeDefaultAddress: async function (req, res, next) {

        let formData = req.body;
        let orderAddressId = formData.id;

        let validation = new Validator(formData, {

            user_id: 'required|integer|inDatabase:order_addresses,user_id',
            id: 'required|integer|inDatabase:order_addresses,id',
            is_default: 'required|boolean'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let updateDefaultAddress = {
            is_default: formData.is_default
        }

        OrderAddress.where('user_id', formData.user_id).save({ "is_default": 0 }, { patch: true })
            .then((response) => {
                return new OrderAddress().where('id', orderAddressId).save(updateDefaultAddress, { patch: true });
            })
            .then((response) => {
                return res.status(200).json(res.fnSuccess(response));
            })
            .catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
    },

    checkTutorCourse: async function (req, res, next) {

        let course_slug = _.toBoolean(req.params.slug) ? req.params.slug : false;
        let user_id = _.toInteger(req.params.user_id) ? req.params.user_id : false;

        let course = Course;

        if (user_id && course_slug) {
            course.forge().query((qb) => {
                qb
                    .leftJoin('user_courses', 'user_courses.course_id', 'courses.id')
                    .where('courses.slug', course_slug)
                    .where('user_courses.user_id', user_id)
            })
                .fetch()
                .then((user_course) => {
                    return res.status(200).json(res.fnSuccess(user_course));
                })
                .catch((err) => {
                    return res.status(400).json(res.fnError(err));
                })
        }
    },

    courseUserStatusUpdate: async function (req, res, next) {

        let formData = req.body;
        let userCourseId = req.params.id;

        let validation = new Validator(formData, {

            course_id: 'required|integer|inDatabase:courses,id',
            status: `required|in:${_.join(getConfig('application.user_course_status'), ',')}`,
            completed_lecture: 'integer',
            certificate_issued_on: 'dateFormat:YYYY-MM-DD'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if ((formData.is_certificate_issued !== '') || (formData.certificate_link !== '') || (formData.certificate_issued_on !== '')) {

            if (await UserCourse.where('id', userCourseId).where('status', 'complete').count() === 0) {
                return res.status(400).json(res.fnError('Please complete your course first!.'));
            }
        }

        let update_user_course_data = {
            status: formData.status,
            completed_lecture: formData.completed_lecture,
            is_archived: formData.is_archived,
            is_certificate_issued: (formData.is_certificate_issued === '') ? 0 : formData.is_certificate_issued,
            certificate_link: formData.certificate_link,
            certificate_issued_on: (formData.certificate_issued_on === '') ? null : formData.certificate_issued_on
        }

        UserCourse.where('id', userCourseId).save(update_user_course_data, { patch: true })
            .then((user_course) => {

                if (formData.status === 'completed') {
                    notificationAlert.courseCompleteNotify(userCourseId)
                }

                return res.status(200).json(res.fnSuccess(user_course));
            })
            .catch((err) => {
                return res.status(400).json(res.fnError(err));
            })
    },

    courseLectureUpdate: async function (req, res, next) {

        let lecture_id = req.params.id;
        let formData = req.body;

        let lecture_data = _.pickBy({
            duration: formData.duration
        }, _.identity)

        CourseLecture.where('id', lecture_id).save(lecture_data, { patch: true }).then((lecture) => {
            return res.status(200).json(res.fnSuccess(lecture));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },

    courseProgressReset: async function (req, res, next) {

        let formData = req.body
        let progressCount = await UserCourseProgress
            .where('user_id', formData.user_id)
            .where('course_id', formData.course_id)
            .where('user_course_id', formData.user_course_id)
            .fetchAll({ columns: ['course_id', 'id', 'user_course_id'] })
        if (progressCount.length > 0) {
            let courseId = _.uniq(_.map(progressCount.toJSON(), 'user_course_id'));
            let progressId = _.uniq(_.map(progressCount.toJSON(), 'id'));

            UserCourseProgress
                .query()
                .whereIn('id', progressId)
                .del()
                .then((response) => {

                    let updateData = {
                        status: 'enrolled',
                        completed_lecture: 0,
                        is_certificate_issued: 0,
                        is_archived: 0,
                        certificate_link: '',
                        certificate_issued_on: null,

                    };

                    return UserCourse.where('id', courseId.toString()).save(updateData, { patch: true });
                })
                .then((userCourseResponse) => {
                    return res.status(200).json(res.fnSuccess(userCourseResponse));
                })
                .catch((err) => {
                    return res.status(400).json(res.fnError(err));
                })
        }
        else {
            return res.status(400).json(res.fnError(`No data found!`));
        }

    },

    notificationViewDate: async function (req, res, next) {

        let user_id = req.params.id;
        return res.status(200).json(res.fnSuccess('response'));
        // let update_data = {
        //     notify_view_date: moment().format('YYYY-MM-DD HH:mm:ss')
        // }

        // User.where('id', user_id).save(update_data, { patch: true })
        //     .then((response) => {
        //         return res.status(200).json(res.fnSuccess(response));
        //     }).catch((errors) => {
        //         return res.status(400).json(res.fnError(errors));
        //     });
    },

    lastestDashboardNotifications: async function (req, res, next) {
        let relationShip = [];
        let user_id = req.params.id;
        let role = _.toBoolean(req.query.role) ? req.query.role :false;
        let user = _.toBoolean(req.query.user);
        let profile = _.toBoolean(req.query.profile);

        let userDetails = await User.where('id', user_id).fetch();

        if(userDetails){
            let userActivateDate = moment(userDetails.toJSON().activated_at).format('YYYY-MM-DD HH:mm:ss');
            let notifyViewDate = userDetails.toJSON().notify_view_date;

            if(notifyViewDate === null){

                var notifySearchDate = userActivateDate;
            }
            else{
                var notifySearchDate = notifyViewDate;
            }

            if (user) {
                relationShip.push('user');
                if (profile) {
                    relationShip.push('user.profile');
                }
            }

            let letestNotification = Notification
                .limit(5)
                .where('created_at', '>', notifySearchDate)
                .orderBy('-id');
            if (role) {
                letestNotification.where('role', req.query.role);
            }
            letestNotification
            .fetchAll({ 'withRelated': relationShip })
            .then((response) => {
                return res.status(200).json(res.fnSuccess(response));
            })
            .catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            })
        }

        // let notifyViewDate = '';

        // let getNotifyViewDate = await User
        //     .where('id', user_id)
        //     .fetch();
        // if (getNotifyViewDate !== null) {
        //     if (user) {
        //         relationShip.push('user');
        //         if (profile) {
        //             relationShip.push('user.profile');
        //         }
        //     }
        //     if (getNotifyViewDate.toJSON().notify_view_date !== null) {
        //         notifyViewDate = getNotifyViewDate.toJSON().notify_view_date;
        //     }
        //     if (await Profile.where('user_id', getNotifyViewDate.toJSON().id).count() === 0) {
        //         return res.status(200).json(res.fnSuccess(``));
        //     }

        //     let letestNotification = Notification
        //         .limit(5)
        //         .where('created_at', '>', notifyViewDate)
        //         .orderBy('-id');
        //     if (role) {
        //         letestNotification.where('role', req.query.role);
        //     }
        //     letestNotification
        //         .fetchAll({ 'withRelated': relationShip })
        //         .then((response) => {
        //             return res.status(200).json(res.fnSuccess(response));
        //         })
        //         .catch((errors) => {
        //             return res.status(400).json(res.fnError(errors));
        //         })
        // } else {
        //     return res.status(400).json(res.fnError(`No record found!.`));
        // }
    },

    couponVerify: async function (req, res, next) {
        let formData = req.body;

        let validationRules = {
            coupon_code: 'required|string|minLength:5|caseSensitive|inDatabase:course_coupons,coupon_code',
            course_id: 'required|integer|inDatabase:course_coupons,course_id',
            user_id: 'required|integer|inDatabase:users,id'
        };

        let validation = new Validator(formData, validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let getCoupon = await CourseCoupon
            .where('course_id', formData.course_id)
            .where('coupon_code', formData.coupon_code)
            .where('started_on', '<=', moment().format('YYYY-MM-DD'))
            .where('ended_on', '>=', moment().format('YYYY-MM-DD'))
            .fetch()

        if (getCoupon) {

            let user_used_coupon = await OrderDetails
                .query((qb) => {
                    qb.count('order_details.id as total_used_coupon')
                    qb.leftJoin('orders', 'orders.id', 'order_details.order_id')
                    qb.where('order_details.productable_id', formData.course_id)
                    qb.where('order_details.productable_type', 'courses')
                    qb.where('orders.user_id', formData.user_id)
                    qb.where('order_details.couponable_id', getCoupon.toJSON().id)
                })
                .fetch();
            if ((getCoupon.toJSON().use_per_user > user_used_coupon.toJSON().total_used_coupon)) {

                let max_used = await OrderDetails
                    .where('order_details.productable_id', formData.course_id)
                    .where('order_details.productable_type', 'courses')
                    .count();
                let total_used = await OrderDetails
                    .where('productable_id', formData.course_id)
                    .where('couponable_id', getCoupon.toJSON().id)
                    .count()
                if (max_used >= total_used) {
                    return res.status(200).json(res.fnSuccess(getCoupon));
                }
                else {
                    return res.status(400).json(res.fnError(`You have used coupon ${formData.coupon_code} more than ${getCoupon.toJSON().use_per_user} times`));
                }
            }
            else {
                return res.status(400).json(res.fnError(`Coupon ${formData.coupon_code} limit exceed.`));
            }

        } else {
            return res.status(400).json(res.fnError(`Coupon ${formData.coupon_code} has been expired or not found!.`));
        }
    },

    courseUploadCertificate: async function (req, res, next) {

        let userCourseId = _.toInteger(req.params.id);
        let formData = req.body;

        if (userCourseId === 0) {
            return res.status(422).json(res.fnError(`Paramater accept only id`));
        }
        let checkCourseStatus = await UserCourse.where('status', 'completed').where('id', userCourseId).count();

        if (checkCourseStatus > 0) {

            let validation = new Validator(formData, {

                is_certificate_issued: 'required|boolean',
                certificate_link: 'required|string|chkUrlFormate',
                certificate_issued_on: 'required|dateFormat:YYYY-MM-DD'
            });

            let matched = await validation.check();

            if (!matched) {
                return res.status(422).json(res.fnError(validation.errors));
            }

            let update_user_course_data = {
                is_certificate_issued: formData.is_certificate_issued,
                certificate_link: formData.certificate_link,
                certificate_issued_on: formData.certificate_issued_on
            }

            UserCourse.where('id', userCourseId).save(update_user_course_data, { patch: true })
                .then((user_course) => {
                    return res.status(200).json(res.fnSuccess(user_course));
                })
                .catch((err) => {
                    return res.status(400).json(res.fnError(err));
                })
        }
        else {
            return res.status(400).json(res.fnError(`Course not completed yet!.`));
        }
    },

    enableDiableAction: async function (req, res, next) {
        let application = Config('application');

        let reqParams = req.params;

        let tableName = req.params.table;
        let id = req.params.id;
        let type = req.params.type;
        let details = null;

        let validationRules = {
            id: 'required|integer',
            table: `required|in:${application.enable_disable_action_table.join(',')}`,
            type: `required|in:${application.enable_disable_action.join(',')}`,
            sender_id: `required|integer`,
            userType: `required`

        }

        let validation = new Validator(req.params, validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        switch (tableName) {
            case 'courses':
                let courseCount = await Course
                    .query((qb) => {
                        qb.select('courses.*')
                        qb.leftJoin('user_courses', 'user_courses.course_id', 'courses.id')
                            .where('user_courses.course_id', id)
                    })
                    .count();
                if (courseCount > 0) {
                    return res.status(400).json(res.fnError(`Course already purchase`));
                }

                Course.where('id', id).save({ 'is_active': (type === 'active') ? 1 : 0 }, { patch: true })
                    .then((success) => {
                        if (type === 'in_active') {
                            if (tableName != 'categories') {
                                notificationAlert.diableNotify(req.params, tableName);
                            }
                        }
                        return res.status(200).json(res.fnSuccess(success));
                    })
                    .catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })


                break;
            case 'categories':
                let catCount = await Category
                    .query((qb) => {
                        qb.select('categories.*')
                        qb.leftJoin('category_course', 'category_course.category_id', 'categories.id')
                            .where('category_course.category_id', id)
                    })
                    .count();
                if (catCount > 0) {
                    return res.status(400).json(res.fnError(`Category already used!.`));
                }

                Category.where('id', id).save({ 'is_active': (type === 'active') ? 1 : 0 }, { patch: true })
                    .then((success) => {
                        if (type === 'in_active') {
                            if (tableName != 'categories') {
                                notificationAlert.diableNotify(req.params, tableName);
                            }
                        }
                        return res.status(200).json(res.fnSuccess(success));
                    })
                    .catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })

                break;
            case 'event_tickets':
                if (await OrderDetails.where('productable_id', id).where('productable_type', 'products').count() > 0) {
                    return res.status(400).json(res.fnError(`Event already used!.`));
                }
                Product.where('id', id).save({ 'is_active': (type === 'active') ? 1 : 0 }, { patch: true })
                    .then((success) => {
                        console.log(type);
                        if (type === 'in_active') {
                            if (tableName != 'categories') {
                                notificationAlert.diableNotify(req.params, tableName);
                            }
                        }
                        return res.status(200).json(res.fnSuccess(success));
                    })
                    .catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })
                break;
            default:
                console.log('nothing');
        }

    },

    softDeleteAction: async function (req, res, next) {
        let application = Config('application');

        let reqParams = req.params;

        let tableName = req.params.table;
        let id = req.params.id;
        let details = null;

        let validationRules = {
            id: 'required|integer',
            table: `required|in:${application.soft_delete_table.join(',')}`,
        }

        let validation = new Validator(req.params, validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        switch (tableName) {
            case 'courses':
                let courseCount = await Course
                    .query((qb) => {
                        qb.select('courses.*')
                        qb.leftJoin('user_courses', 'user_courses.course_id', 'courses.id')
                            .where('user_courses.course_id', id)
                    })
                    .count();
                if (courseCount > 0) {
                    return res.status(400).json(res.fnError(`Course already purchased`));
                }
                Course.where('id', id).save({ 'is_delete': 1 }, { patch: true })
                    .then((success) => {
                        notificationAlert.softDeleteNotify(req.params, tableName);
                        return res.status(200).json(res.fnSuccess(success));
                    })
                    .catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })
                break;
            case 'event_tickets':
                if (await OrderDetails.where('productable_id', id).where('productable_type', 'products').count() > 0) {
                    return res.status(400).json(res.fnError(`Event Ticke already purchased!.`));
                }
                Product.where('id', id).save({ 'is_delete': 1 }, { patch: true })
                    .then((success) => {
                        notificationAlert.softDeleteNotify(req.params, tableName);
                        return res.status(200).json(res.fnSuccess(success));
                    })
                    .catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })
                break;
            default:
                console.log('nothing');
        }

    },

    sxlAddressUpdate: async function (req, res, next) {

        let formData = req.body;

        let validation = new Validator(formData, {

            order_id: 'required|integer|inDatabase:orders,id',
            user_id: 'required|integer|inDatabase:orders,user_id'

        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let update_address = {
            sxl_address: formData.sxl_address
        }

        Order.where('id', formData.order_id).save(update_address, { patch: true })
            .then((details) => {
                return res.status(200).json(res.fnSuccess(details));
            })
            .catch((err) => {
                return res.status(400).json(res.fnError(err));
            })
    },

    resellerProductSoftDelete: async function (req, res, next) {
        let formData = req.body;
        if (_.isObject(formData)) {
            let ids = _.uniq(_.map(formData, 'id'));

            ResellerProduct.whereIn('id', ids).save({ 'is_delete': 1 }, { patch: true })
                .then((resellerProductResponse) => {
                    return res.status(200).json(res.fnSuccess('Success Deleted your data!.'));
                })
                .catch((err) => {
                    return res.status(400).json(res.fnError(err));
                })
        }
        else {
            return res.status(400).json(res.fnError(`Data must be in object`));
        }
    },

    resellerProductApproval: async function (req, res, next) {

        let formData = req.body;
        if (_.isObject(formData)) {

            let validationRule = {
                approved_by: 'required|integer',
                approved_date: 'required|dateFormat:YYYY-MM-DD'
            };

            let validation = new Validator(formData, validationRule);

            let matched = await validation.check();

            if (!matched) {
                return res.status(422).json(res.fnError(validation.errors));
            }

            let userData = await User
                .query((qb) => {
                    qb.leftJoin('role_user', 'role_user.user_id', 'users.id')
                    qb.leftJoin('roles', 'roles.id', 'role_user.role_id')
                    qb.where('users.id', formData.approved_by)
                    qb.where('roles.name', 'admin')
                })
                .count();

            if (userData === 0) {
                return res.status(400).json(res.fnError(`Approver must be admin`));
            }

            let ids = _.uniq(_.map(formData.items, 'id'));

            ResellerProduct.whereIn('id', ids).save({ 'approved_by': formData.approved_by, 'approved_date': formData.approved_date, 'is_approved': 1 }, { patch: true })
                .then((resellerProductResponse) => {

                    notificationAlert.resellerProductApproved(formData.items, formData.approved_by);
                    return res.status(200).json(res.fnSuccess('Success Deleted your data!.'));
                })
                .catch((err) => {
                    return res.status(400).json(res.fnError(err));
                })
        }
        else {
            return res.status(400).json(res.fnError(`Data must be in object`));
        }
    },

    isKycApprove: async function (req, res, next) {

        let formData = req.body;

        if (!_.isArray(formData.ids)) {
            return res.status(400).json(res.fnError('Input Data Must be in array!.'));
        }
        let validation = new Validator({
            userId: formData.ids
        },
            {
                'userId': 'required|array',
                'userId.*.id': 'required|integer|inDatabase:users,id'
            }
        );
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let ids = _.map(formData.ids, 'id');

        User.whereIn('id', ids).save({ 'is_kyc': formData.is_kyc }, { patch: true }).then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },
    vendorAgreement: async function (req, res, next) {
        let formData = req.body;

        let validationRule = {
            in_agreement: 'required|boolean',
            agreement_pdf: 'required|chkUrlFormate',
            user_id: 'required'
        };

        let validation = new Validator(formData, validationRule);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if (await Profile.where('user_id', formData.user_id).count() === 0) {
            return res.status(400).json(res.fnError('Please complete your profile before create course.'));
        }

        User.where('id', formData.user_id).save({ 'in_agreement': formData.in_agreement, 'agreement_pdf': formData.agreement_pdf }, { patch: true })
            .then((response) => {
                User.where('id', formData.user_id).fetch({ withRelated: 'profile' })
                    .then((userData) => {
                        mailNotification.vendorAgreementMail(formData, userData);
                    })
                return res.status(200).json(res.fnSuccess(response));
            })
            .catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
    },

    getPaymentType: async function (req, res, next) {
        PaymentType.where('is_active', 1).fetchAll().then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        })
            .catch((errors) => {
                return res.status(200).json(res.fnSuccess(errors));
            })
    },
    setProductPrice: async function (req, res, next) {
        let formData = req.body;
        let application = Config('application');

        let sxlToUsdRate = await Setting.where('access_key','sxl_to_usd_rate').fetch();

        if (!_.isArray(formData.categoryPrice)) {
            return res.status(400).json(res.fnError('Category Price Must be in array!.'));
        }

        let validation = new Validator({
            pricable_id: 'required|integer',
            pricable_type: `required|in:${application.pricable_type.join(',')}`,
            payment_type_id: 'required|integer',
            priceCategory: formData.categoryPrice
        },
            {
                'priceCategory': 'required|array',
                'priceCategory.*.payment_category_id': 'required|integer',
                'priceCategory.*.quantity': 'required|integer',
                'priceCategory.*.sxl_price': 'decimal',
                'priceCategory.*.usd_price': 'decimal'
            }
        );

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if (formData.pricable_type === 'courses') {
            if (await Course.where('id', formData.pricable_id).where('is_active', 1).where('is_delete', 0).count() === 0) {
                return res.status(400).json(res.fnError('Courses not found!'));
            }
        }

        if (formData.pricable_type === 'products') {
            if (await Product.where('id', formData.pricable_id).where('is_delete', 0).count() === 0) {
                return res.status(400).json(res.fnError('Product not found!'));
            }
        }

        if (await PaymentType.where('id', formData.payment_type_id).where('is_active', 0).count() === 1) {
            return res.status(400).json(res.fnError('Please use a different Payment Type!.'));
        }

        if (await OrderDetails.where('productable_id', formData.pricable_id).where('productable_type', formData.pricable_type).count() > 0) {
            return res.status(400).json(res.fnError(`Someone has already purchased this ticket.So you cannot edit this ticket anymore`));
        }

        if (formData.payment_type_id == 1) {  // usd
            formData['usd_price'] = formData.total_price;
        }
        if (formData.payment_type_id == 2) { // sxl
            formData['sxl_price'] = formData.total_price;
           // formData['sxl_to_usd_rate'] = application.sxl_to_usd_rate;
           formData['sxl_to_usd_rate'] = sxlToUsdRate.get('value');
        }
        if (formData.payment_type_id == 3) { // usd plus sxl
            if (formData.pricable_type === 'courses') {
                let price = (application.amount_divisor > 0) ? _.divide(formData.total_price, application.amount_divisor) : formData.total_price;
                formData['usd_price'] = price;
                // formData['sxl_price'] = _.multiply(price, application.sxl_to_usd_rate);
                // formData['sxl_to_usd_rate'] = application.sxl_to_usd_rate;

                formData['sxl_price'] = _.multiply(price, sxlToUsdRate.get('value'));
                formData['sxl_to_usd_rate'] = sxlToUsdRate.get('value');
            }
        }
        let priceData = [];

        _.map(formData.categoryPrice, function (v) {

            if (formData.pricable_type === 'products') {
                if (formData.payment_type_id == 3) {
                   //  let slxPrice = _.multiply(v.sxl_price, application.sxl_to_usd_rate);

                   let slxPrice = _.multiply(v.sxl_price, sxlToUsdRate.get('value'));
                    formData['total_price'] = _.add(v.usd_price, slxPrice)
                }
            }

            priceData.push({
                id: v.product_price_id,
                pricable_id: formData.pricable_id,
                pricable_type: formData.pricable_type,
                payment_type_id: formData.payment_type_id,
                total_price: formData.total_price,
                payment_category_id: v.payment_category_id,
                sxl_price: (formData.pricable_type === 'courses') ? formData.sxl_price : v.sxl_price,
                usd_price: (formData.pricable_type === 'courses') ? formData.usd_price : v.usd_price,
                quantity: v.quantity,
                // sxl_to_usd_rate: application.sxl_to_usd_rate
                sxl_to_usd_rate: sxlToUsdRate.get('value')
            })
        })
        new ProductPrice()
            .createOrUpdate(priceData, ['pricable_id', 'pricable_type', 'payment_type_id', 'total_price', 'payment_category_id', 'sxl_price', 'usd_price', 'quantity', 'sxl_to_usd_rate'])
            .then((rspon) => {
                return new ProductPrice().where('pricable_id', formData.pricable_id).where('pricable_type', formData.pricable_type).fetchAll();
            })
            .then((responsePriceData) => {
                return res.status(200).json(res.fnSuccess(responsePriceData));
            })
            .catch((err) => {
                return res.status(400).json(res.fnError(err));
            })
    },
    setProductPriceFree: async function (req, res, next) {

        let paymentPriceId = req.params.id;

        ProductPrice.where('id', paymentPriceId).destroy({ require: false }).then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },
    checkCourseOrderStatus: async function (req, res, next) {
        if (await commonFunction.courseEditOrderStatusCheck(req.params.id) === true) {
            return res.status(400).json(res.fnError(`Someone has already purchased this course`));
        }
        else {
            return res.status(200).json(res.fnSuccess(`Course is now available to edit`));
        }
    },
    getConfigSetting: async function (req, res, next) {

        return res.status(200).json(res.fnSuccess(getConfig('application')));
    },
    productPriceDelate: async function (req, res, next) {
        let priceId = req.params.id;
        let type = req.params.type;
        let productId = req.query.product_id;

        if (await OrderDetails.where('productable_id', productId).where('productable_type', type).count() > 0) {
            return res.status(400).json(res.fnError(`Someone has already purchased this ticket.So you cannot edit this ticket anymore`));
        }

        ProductPrice
            .where('id', priceId)
            .where('pricable_type', type)
            .destroy({ required: false })
            .then((response) => {
                if (type === 'products') {
                    Product.where('id', productId).save({ "status": "draft" }, { patch: true })
                }
                return res.status(200).json(res.fnSuccess(response));
            })
            .catch((error) => {
                return res.status(400).json(res.fnError(error));
            })
    },
    getMyEventList: async function (req, res, next) {
        let userId = req.params.userId;

        let has_pagination = _.toBoolean(req.query.pagination);
        let limit = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;

        let order = Order
            .query((qb) => {
                qb.select('orders.id', 'orders.user_id', 'products.title', 'products.slug', 'order_details.quantity', 'order_details.total_usd', 'order_details.total_sxl', 'start_date', 'end_date', Bookshelf.knex.raw("(SELECT images.thumbnail From images where images.imagable_type = 'products' and images.imagable_id = products.id order by id DESC limit 1) as event_image"), 'countries.name as country_name', 'payment_categories.title as payment_category')
                qb.leftJoin('order_details', 'order_details.order_id', 'orders.id')
                qb.leftJoin('products', 'products.id', 'order_details.productable_id')
                qb.leftJoin('product_events', 'product_events.product_id', 'products.id')
                qb.leftJoin('countries', 'countries.id', 'product_events.country_id')
                qb.leftJoin('payment_categories', 'payment_categories.id', 'order_details.payment_category_id')
                qb.where('order_details.productable_type', 'products')
            })
            .where('orders.user_id', userId)
            .where('orders.order_status', 'complete')
            .where('orders.is_delete', 0)
            .orderBy('-orders.id')

        if (has_pagination) {
            let relation_params = Object.assign({ pageSize: limit, page: page },

            );
            order = order.fetchPage(relation_params);
        }
        else {
            order = order.fetchAll();
        }

        order
            .then((orderResponse) => {
                return res.status(200).json(res.fnSuccess(orderResponse));
            })
            .catch((err) => {
                return res.status(400).json(res.fnError(err));
            })
    },

    product_left_panel: async function (req, res, next) {
        let params = req.params.type;

        Bookshelf.knex.raw("CALL sp_product_left_panel_count(\'"+params+"\')")
            .then((response) => {
                return res.status(200).json(res.fnSuccess(response[0][0]));
            }).catch((err) => {
                return res.status(400).json(res.fnError(err));
            });
    },

    is_fast_selling: async function (req, res, next) {
        let id = req.params.id;
        let type = req.params.type;
        let is_fast_selling = req.params.isFastSelling;

        switch (type) {
            case 'products':
                Product.where('id', id)
                    .save({ "is_fast_selling": is_fast_selling }, { patch: true })
                    .then((sellingResponse) => {
                        return res.status(200).json(res.fnSuccess(sellingResponse));
                    })
                    .catch((errors) => {
                        return res.status(400).json(res.fnError(errors));
                    });
                break;
            default:
                console.log('nothing');
        }
    },

    getCommissionReport: function (req, res, next) {
        let vendorCommission = _.toBoolean(req.query.vendor);
        let resellerCommission = _.toBoolean(req.query.reseller);
        let searchDate = _.toBoolean(req.query.search_date) ? escape(req.query.search_date).trim() : false;

        if (searchDate) {
            if (vendorCommission) {

                Bookshelf.knex.raw(`SELECT count(orders.id) as no_of_order, SUM(orders.total_order_price) as total_order_price, FORMAT(sum(((orders.total_order_price * order_details.vendor_commission_rate) / 100)),'N7') as vendor_commission , CONCAT( MONTHNAME(  order_details.created_at ) ,  ' - ', YEAR( order_details.created_at ) ) AS month , profiles.first_name, profiles.last_name, profiles.middle_name, order_details.vendor_id
                FROM order_details  INNER join profiles on profiles.user_id = order_details.vendor_id
                INNER JOIN orders ON orders.id = order_details.order_id
                WHERE  orders.order_status = 'complete'
                AND order_details.payment_type_id !=4
                and order_details.created_at LIKE '%${searchDate}%'
                AND order_details.vendor_id is not null
                group by CONCAT( MONTHNAME(  order_details.created_at ) ,  ' - ', YEAR(  order_details.created_at ) ) , order_details.vendor_id`)

                    .then((commissionReprtDetails) => {
                        return res.status(200).json(res.fnSuccess(commissionReprtDetails[0]));
                    }).catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })

                // OrderDetails
                //     .query((qb) => {
                //         qb.select(Bookshelf.knex.raw(`SUM(  order_details.vendor_commission_rate ) AS commission_amount_rate, SUM( orders.total_order_price ) AS order_total_price, CONCAT( MONTHNAME(  order_details.created_at ) ,  ' - ', YEAR( order_details.created_at ) ) AS month , profiles.first_name, profiles.last_name, profiles.middle_name`), 'order_details.vendor_id')
                //         qb.leftJoin('profiles', 'profiles.user_id', 'order_details.vendor_id')
                //         qb.leftJoin('orders','orders.id','order_details.order_id')
                //         qb.where('order_details.created_at', 'LIKE', `%${searchDate}%`)
                //         qb.where('order_details.payment_type_id','!=','4')
                //         qb.where('orders.order_status','complete')
                //         qb.whereNotNull('order_details.vendor_id')
                //         qb.groupByRaw(`CONCAT( MONTHNAME(  order_details.created_at ) ,  ' - ', YEAR(  order_details.created_at ) ) , order_details.vendor_id`)
                //     })
                //     .fetchAll()
                //     .then((commissionReprtDetails) => {
                //         return res.status(200).json(res.fnSuccess(commissionReprtDetails));
                //     }).catch((err) => {
                //         return res.status(400).json(res.fnError(err));
                //     })
            }
            if (resellerCommission) {

                OrderDetails
                    .query((qb) => {
                        qb.select(Bookshelf.knex.raw(`SUM(  order_details.reseller_commission_rate ) AS commission_amount_rate, SUM( orders.total_order_price ) AS order_total_price, CONCAT( MONTHNAME(  order_details.created_at ) ,  ' - ', YEAR( order_details.created_at ) ) AS month , profiles.first_name, profiles.last_name, profiles.middle_name`), 'order_details.reseller_id')
                        qb.leftJoin('profiles', 'profiles.user_id', 'order_details.reseller_id')
                        qb.leftJoin('orders','orders.id','order_details.order_id')
                        qb.where('order_details.created_at', 'LIKE', `%${searchDate}%`)
                        qb.where('order_details.payment_type_id','!=','4')
                        qb.where('orders.order_status','complete')
                        qb.whereNotNull('order_details.reseller_id')
                        qb.groupByRaw(`CONCAT( MONTHNAME(  order_details.created_at ) ,  ' - ', YEAR(  order_details.created_at ) ) , order_details.reseller_id`)
                    })
                    .fetchAll()
                    .then((resellerReprtDetails) => {
                        return res.status(200).json(res.fnSuccess(resellerReprtDetails));
                    }).catch((err) => {
                        return res.status(400).json(res.fnError(err));
                    })
            }
        }
        else{

        }
    },
    salesReport: async function(req,res,next){


        let fetchCustomerType = _.toBoolean(req.query.type) ? req.query.type : false;
        let vendorId          = _.toInteger(req.query.vendor_id) ? req.query.vendor_id : false;
        let startDate = req.query.start_date || false;
        let endDate = req.query.end_date || false;


        let sql = "SELECT order_details. * , courses.id AS course_id, products.id AS product_id, products.title AS ptitle, courses.title AS ctitle, products.slug AS pslug, courses.slug AS cslug, users.user_name AS email, CONCAT( profiles.first_name,  ' ', profiles.last_name ) AS user_name, orders.order_status,users.mobile_no,users.phone_code,payment_types.title as payment_type,CONCAT( product_events.start_date,  ' To ', product_events.end_date ) AS event_date,payment_categories.title as category_name FROM  order_details LEFT JOIN products ON products.id = order_details.productable_id AND order_details.productable_type =  'products' LEFT JOIN payment_categories on payment_categories.id = order_details.payment_category_id LEFT JOIN courses ON courses.id = order_details.productable_id AND order_details.productable_type =  'courses' LEFT JOIN product_events ON product_events.product_id = products.id LEFT JOIN users ON users.id = order_details.user_id LEFT JOIN profiles ON profiles.user_id = users.id LEFT JOIN payment_types ON payment_types.id = order_details.payment_type_id LEFT JOIN orders ON orders.id = order_details.order_id where DATE( order_details.created_at ) BETWEEN \'"+escape(startDate).trim()+"\' AND \'"+escape(endDate).trim()+"\'";


        switch(fetchCustomerType){
            case 'vendor':
                if(vendorId){
                    sql += " and order_details.vendor_id = \'"+escape(vendorId).trim()+"\'"
                }
            break;
            case 'customer':
                // customer
            break;
            default:
            console.log('default');
        }

        sql += ` order by order_details.id DESC`;
        console.log(sql);
        Bookshelf.knex.raw(sql)
        .then((orderDetailResponse)=>{
            return res.status(200).json(res.fnSuccess(orderDetailResponse[0]));
        })
        .catch((err)=>{
            return res.status(400).json(res.fnError(err));
        })
    },

    /* Function Name : Event Ticket Resend Details
        * Author : RP
        * Created Date : 22-07-2019
        * Modified Date : *
        * Purpose : Get all ticket event and user
        * Params: event, user, event_id
        * Required:All
        * Optional:
        * Data type:
    */
    eventTicketResendDetails: async function(req,res,next){

        let getEventList = _.toBoolean(req.query.event);
        let getEventUser = _.toBoolean(req.query.user);
        let getEventId = _.toInteger(req.query.event_id);

        if(getEventList){
            AttendeeInformation
            .query((q)=>{
                q.select('product_events.id as event_id','products.title','attendee_informations.order_id','attendee_informations.user_id','attendee_informations.attendee','attendee_informations.id')
                q.leftJoin('product_events','product_events.id','attendee_informations.event_id')
                q.leftJoin('products','products.id','product_events.product_id')
                q.where('attendee_informations.ticket_sent_status','1')
                q.where('products.product_type','event_ticket')
                q.groupBy('attendee_informations.event_id')

            })
            .fetchAll()
            .then((details)=>{
                return res.status(200).json(res.fnSuccess(details));
            })
            .catch((err)=>{
                return res.status(400).json(res.fnError(err));
            })
        }
        if(getEventUser){
            AttendeeInformation
            .query((q)=>{
                q.select('profiles.first_name','profiles.last_name','profiles.user_id','attendee_informations.order_id','attendee_informations.event_id','attendee_informations.attendee','attendee_informations.id','users.user_name')
                q.leftJoin('users','users.id','attendee_informations.user_id')
                q.leftJoin('profiles','profiles.user_id','attendee_informations.user_id')
                q.where('attendee_informations.ticket_sent_status','1')
                q.where('attendee_informations.event_id',getEventId)
                q.groupBy('attendee_informations.user_id')
            })
            .fetchAll()
            .then((details)=>{
                return res.status(200).json(res.fnSuccess(details));
            })
            .catch((err)=>{
                return res.status(400).json(res.fnError(err));
            })
        }

    },
     /* Function Name : Event Ticket Resend
        * Author : RP
        * Created Date : 22-07-2019
        * Modified Date : *
        * Purpose : Resend Event ticket from admin after ticket generate
        * Params: event_id, user_id, order_id,attendee_id
        * Required:All
        * Optional:
        * Data type:
    */
    resendEventTicket: async function(req,res,next){

        let eventId = _.toInteger(req.body.event_id);
        let userId = _.toInteger(req.body.user_id);
        let orderId = _.toInteger(req.body.order_id);
        let attendeeId = _.toInteger(req.body.attendee_id);

        if(attendeeId && userId && orderId && attendeeId){
            AttendeeInformation
            .where('event_id',eventId)
            // .where('order_id',orderId)
            .where('user_id',userId)
            //.where('id',attendeeId)
            .where('ticket_sent_status',1)
            .fetchAll({"withRelated":[
                {
                    "country":function(q){
                        q.select('id','name')
                    },
                    "event_details":function(q){
                        q.select('id','unique_event_id','start_date','end_date','country_id','state_id','city_id','product_id','banner_image')
                    },
                    "event_details.product":function(q){
                        q.select('id','title')
                    },
                    "event_details.country":function(q){
                        q.select('id','name')
                    },
                    "event_details.state":function(q){
                        q.select('id','name')
                    },
                    "event_details.city":function(q){
                        q.select('id','name')
                    },
                    "payment_category":function(q){
                        q.select('id','title')
                    }
                },
                "attendee_details",
                "attendee_details.country",
            ]})
            .then((ticketDetails)=>{
                if(!_.isEmpty( ticketDetails.toJSON() )){
                    _.map(ticketDetails.toJSON(),function(detail){
                        if(detail.attendee == 1){
                            generateBarAndQrCode.createBarCode(detail)
                        }
                    })
                    return res.status(200).json(res.fnSuccess('Successfully send your ticket!.'));
                }
                else{
                    return res.status(400).json(res.fnError('No data found!'));
                }
            })
            .catch((err)=>{
                return res.status(400).json(res.fnError(err));
            })
        }
        else
        {
            return res.status(400).json(res.fnError('parameter missing'));
        }

    },

    adminApprove: async function(req,res,next){
        let formData = req.body;

        if(formData.type == 'courses'){
            if(await Course.where('id',formData.id).count() == 0){
                return res.status(400).json(res.fnError(`Course Id not found. `));
            }
            else{
                Course.where('id',formData.id).save({"approved_status":1,"approved_by":formData.approved_by},{patch:true}).then((response)=>{
                    return res.status(200).json(res.fnSuccess(response));
                }).catch((errors)=>{
                    return res.status(400).json(res.fnError(errors));
                });
            }
        }
        if(formData.type == 'event_tickets'){
            if(await Product.where('id',formData.id).count() == 0){
                return res.status(400).json(res.fnError(`Product Id not found. `));
            }
            else{
                Product.where('id',formData.id).save({"approved_status":1,"approved_by":formData.approved_by},{patch:true}).then((response)=>{
                    return res.status(200).json(res.fnSuccess(response));
                }).catch((errors)=>{
                    return res.status(400).json(res.fnError(errors));
                });
            }
        }

    }
}

module.exports = UtilityController;
