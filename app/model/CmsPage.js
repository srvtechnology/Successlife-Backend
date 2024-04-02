
const bookshelf= Config('database');

module.exports = bookshelf.model('CmsPage',{

    hasTimestamps : true,

    tableName : 'cms_pages'
});