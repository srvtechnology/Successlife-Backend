
const bookshelf= Config('database');

module.exports = bookshelf.model('UserCourseProgress',{

    hasTimestamps : true,

    tableName : 'user_course_progresses',
});