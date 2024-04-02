const bookshelf= Config('database');

module.exports = bookshelf.model('ProductOffer',{

    hasTimestamps : true,

    tableName : 'product_offers',
});