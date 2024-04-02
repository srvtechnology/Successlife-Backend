
const bookshelf= Config('database');

module.exports = bookshelf.model('State',{

    hasTimestamps : true,

    tableName : 'states'
});