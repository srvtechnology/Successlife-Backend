const bookshelf= Config('database');

module.exports = bookshelf.model('Cities',{

    hasTimestamps : true,

    tableName : 'cities',
});