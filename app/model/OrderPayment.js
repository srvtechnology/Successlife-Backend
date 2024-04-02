
const bookshelf= Config('database');

module.exports = bookshelf.model('OrderPayment',{

    hasTimestamps : false,

    tableName : 'order_payments',
});