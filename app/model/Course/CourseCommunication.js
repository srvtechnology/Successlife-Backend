
const bookshelf= Config('database');

module.exports = bookshelf.model('CourseCommunication',{

    hasTimestamps : true,

    tableName : 'course_communications',

    course : function(){
        return this.belongsTo(Model('Course/Course'),'course_id')
    }
});