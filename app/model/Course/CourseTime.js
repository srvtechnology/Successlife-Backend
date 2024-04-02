const bookshelf= Config('database');

module.exports = bookshelf.model('CourseTime',{

    hasTimestamps : false,

    tableName : 'course_times',
});