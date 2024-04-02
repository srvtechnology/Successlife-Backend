const bookshelf= Config('database');

module.exports = bookshelf.model('CourseStander',{

    hasTimestamps : false,

    tableName : 'course_standers',
});