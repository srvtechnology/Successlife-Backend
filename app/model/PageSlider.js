
const bookshelf= Config('database');

module.exports = bookshelf.model('PageSlider',{

    hasTimestamps : true,

    tableName : 'page_sliders',
});