const bookshelf= Config('database');

module.exports = bookshelf.model('Countries',{

    hasTimestamps : true,

    tableName : 'countries',    
});