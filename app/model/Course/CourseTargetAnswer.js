const bookshelf= Config('database');

module.exports = bookshelf.model('CourseTargetAnswer',{

    hasTimestamps : true,

    tableName : 'course_target_answers'

});