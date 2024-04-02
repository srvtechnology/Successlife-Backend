
const bookshelf= Config('database');

module.exports = bookshelf.model('CategoryProductSpeaker',{

    hasTimestamps : true,

    tableName : 'category_product_speakers',
});