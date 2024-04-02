
const bookshelf= Config('database');

module.exports = bookshelf.model('Setting',{

    hasTimestamps : true,

    tableName : 'site_settings',
});