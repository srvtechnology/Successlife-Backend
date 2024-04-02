
const bookshelf= Config('database');

module.exports = bookshelf.model('City',{

    hasTimestamps : true,

    tableName : 'cities'
});