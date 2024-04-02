
const bookshelf= Config('database');

module.exports = bookshelf.model('resellerProductLog',{

    hasTimestamps : true,

    tableName : 'reseller_product_logs',
});