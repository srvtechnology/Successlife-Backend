
const bookshelf= Config('database');

module.exports = bookshelf.model('PaymentCategory',{

    hasTimestamps : true,

    tableName : 'payment_categories',
});