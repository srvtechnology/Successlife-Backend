
const bookshelf= Config('database');

module.exports = bookshelf.model('ReviewDetails',{

    hasTimestamps : true,

    tableName : 'review_details',

    review : function(){
           return this.belongsTo(Model('Review/Reviews'),'review_id') 
    },
    review_question : function(){
        return this.belongsTo(Model('Review/ReviewQuestions'),'review_question_id') 
    },
    review_option : function(){
        return this.belongsTo(Model('Review/ReviewOptions'),'review_option_id') 
    }
});