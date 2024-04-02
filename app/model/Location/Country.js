const bookshelf= Config('database');

module.exports = bookshelf.model('Country',{

    hasTimestamps : true,

    tableName : 'countries'
});