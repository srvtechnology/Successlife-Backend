const bookshelf= Config('database');

module.exports = bookshelf.model('CourseCoupon',{

    hasTimestamps : true,

    tableName : 'course_coupons'
    
});