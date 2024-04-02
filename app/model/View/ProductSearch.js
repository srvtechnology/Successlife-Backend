const bookshelf= Config('database');

module.exports = bookshelf.model('ProductSearch',{

    hasTimestamps : true,

    tableName : 'vw_product_searches_2',
});