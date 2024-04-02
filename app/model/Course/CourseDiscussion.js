
const bookshelf= Config('database');

module.exports = bookshelf.model('CourseDiscussion',{

    hasTimestamps : true,

    tableName : 'course_discussions',

    user : function(){
        return this.belongsTo(Model('User'),'user_id');
    },
    course : function(){
        return this.belongsTo(Model('Course/Course'),'course_id');
    },
    course_discussions_response: function(){
        return this.hasMany(Model('Course/CourseDiscussionsResponse'),'course_discussions_id');
    }    
});