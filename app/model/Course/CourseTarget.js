const bookshelf= Config('database');

module.exports = bookshelf.model('CourseTarget',{

    hasTimestamps : false,

    tableName : 'course_targets',

    course_answer : function(){
        return this.hasMany(Model('Course/CourseTargetAnswer'))
    }
});