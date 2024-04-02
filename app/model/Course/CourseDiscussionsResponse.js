
const bookshelf= Config('database');

module.exports = bookshelf.model('CourseDiscussionsResponse',{

    hasTimestamps : true,

    tableName : 'course_discussions_response',

    course_discussions: function(){
        return this.belongsTo(Model('Course/CourseDiscussion'),'course_discussions_id');
    },

    user : function(){
        return this.belongsTo(Model('User'),'user_id');
    }

});

 