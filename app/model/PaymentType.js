
const bookshelf= Config('database');

module.exports = bookshelf.model('PaymentType',{

    hasTimestamps : true,

    tableName : 'payment_types',
});