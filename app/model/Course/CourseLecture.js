
const bookshelf= Config('database');

module.exports = bookshelf.model('CourseLecture',{

    hasTimestamps : true,

    tableName : 'course_lectures',

    user_course_progresses: function(){
        return this.hasOne(Model('Course/UserCourseProgress'),'course_lecture_id');
    }
    
});