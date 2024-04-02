
const bookshelf= Config('database');

module.exports = bookshelf.model('ReviewQuestions',{

    hasTimestamps : true,

    tableName : 'review_questions',
});