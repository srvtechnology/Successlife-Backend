const Validator     = Helper('validator');
const CourseCoupon  = Model('Course/CourseCoupon');

const CourseCouponController = {

    index:function(req, res,next){

        let has_createdBy   = _.toBoolean(req.query.created_by); 
        let has_courseId    = _.toBoolean(req.query.course_id); 
        let course_coupon   = CourseCoupon.forge().orderBy('-id');

        if(has_createdBy){
            course_coupon = course_coupon.where('created_by',req.query.created_by);
        }

        if(has_courseId){
            course_coupon = course_coupon.where('course_id',req.query.course_id);
        }

        course_coupon.fetchAll().then((coupons)=>{
            return res.status(200).json(res.fnSuccess(coupons));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        
        let formData        = req.body;
        let validation      = new Validator(formData,{
            coupon_code     :'required|string|maxLength:20|caseSensitive|minLength:5|unique:course_coupons,coupon_code',
            discount_mode   :'required|string|in:fixed',
            discount_value  :'required|decimal',
            max_discount    :'required|decimal',
            use_per_user    :'required|integer',
            max_use         :'required|integer',
            started_on      :'required|dateFormat:YYYY-MM-DD',
            ended_on        :'required|dateFormat:YYYY-MM-DD',
            course_id       :'required|integer|inDatabase:courses,id',
            created_by      :'required|integer|inDatabase:users,id'
        });

        if(await CourseCoupon.whereRaw(`'${formData.started_on}' BETWEEN DATE(started_on) AND DATE(ended_on) and course_id = ${formData.course_id}`).count() != 0){
            return res.status(400).json(res.fnError(`Coupon is already running!. `));
        }        
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let coupon_data = _.pickBy({
            coupon_code     :formData.coupon_code,
            discount_mode   :formData.discount_mode,
            discount_value  :formData.discount_value,
            max_discount    :formData.max_discount,
            use_per_user    :formData.use_per_user,
            max_use         :formData.max_use,
            started_on      :formData.started_on,
            ended_on        :formData.ended_on,
            course_id       :formData.course_id,
            created_by      :formData.created_by,
        },_.identity)

        new CourseCoupon(coupon_data).save().then((coupon)=>{
            return res.status(200).json(res.fnSuccess(coupon));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let coupon_id = req.params.id;

        CourseCoupon.where('id',coupon_id).fetch().then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let coupon_id       = req.params.id;
        let formData        = req.body;

        let validation      = new Validator(formData,{
            // discount_mode   :'string|in:fixed',
            // discount_value  :'decimal',
            // max_discount    :'decimal',
            // use_per_user    :'integer',
            // max_use         :'integer',
            // started_on      :'dateFormat:YYYY-MM-DD',
            ended_on        :'dateFormat:YYYY-MM-DD',
            // course_id       :'integer|inDatabase:courses,id',
            //  created_by      :'integer|inDatabase:users,id'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let coupon_data = _.pickBy({
            // discount_mode   :formData.discount_mode,
            // discount_value  :formData.discount_value,
            // max_discount    :formData.max_discount,
            // use_per_user    :formData.use_per_user,
            // max_use         :formData.max_use,
            // started_on      :formData.started_on,
            ended_on        :formData.ended_on,
           // course_id       :formData.course_id,
            // created_by      :formData.created_by,
        },_.identity)

        CourseCoupon.where('id',coupon_id).save(coupon_data,{patch:true}).then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let coupon_id   = req.params.id;

        CourseCoupon.where('id',coupon_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CourseCouponController;