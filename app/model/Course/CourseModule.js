const bookshelf= Config('database');

module.exports = bookshelf.model('CourseModule',{

    hasTimestamps : true,

    tableName : 'course_modules',

    course_lectures:function(){
        return this.hasMany(Model('Course/CourseLecture'))
    }
}); 