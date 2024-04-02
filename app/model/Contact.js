const bookshelf= Config('database');

module.exports = bookshelf.model('Contact',{

    hasTimestamps : true,

    tableName : 'contacts',
});