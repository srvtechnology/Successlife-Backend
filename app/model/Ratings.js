
const bookshelf= Config('database');

module.exports = bookshelf.model('Ratings',{

    hasTimestamps : true,

    tableName : 'ratings',
});