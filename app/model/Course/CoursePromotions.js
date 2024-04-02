
const bookshelf= Config('database');

module.exports = bookshelf.model('CoursePromotions',{

    hasTimestamps : true,
    
    tableName : 'course_promotions', 

    course: function () {
        return this.belongsTo(Model('Course/Course'), 'course_id')
    },
    promotion_user: function () {
        return this.belongsTo(Model('User'), 'user_id')
    },
    order: function () {
        return this.belongsTo(Model('Order/Orders'), 'order_id')
    }   
}); 