
const bookshelf = Config('database');

module.exports = bookshelf.model('UserCourse', {

    hasTimestamps: true,

    tableName: 'user_courses',

    course: function () {
        return this.belongsTo(Model('Course/Course'), 'course_id')
    },
    user: function () {
        return this.belongsTo(Model('User'), 'user_id')
    },
    order: function () {
        return this.belongsTo(Model('Order/Orders'), 'order_id')
    }
}); 