
const bookshelf= Config('database');

module.exports = bookshelf.model('Images',{

    hasTimestamps : true,

    tableName : 'images',
});