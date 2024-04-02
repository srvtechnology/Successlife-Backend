
const bookshelf= Config('database');

module.exports = bookshelf.model('ReviewOptions',{

    hasTimestamps : true,

    tableName : 'review_options',

    review_questions : function(){
        return this.belongsTo(Model('Review/ReviewQuestions'),'review_question_id');
    }
});