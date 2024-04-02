const bookshelf= Config('database');

module.exports = bookshelf.model('States',{

    hasTimestamps : true,

    tableName : 'states',
});