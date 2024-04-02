
const bookshelf= Config('database');

module.exports = bookshelf.model('Video',{

    hasTimestamps : true,

    tableName : 'videos',
});