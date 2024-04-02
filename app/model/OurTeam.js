
const bookshelf= Config('database');

module.exports = bookshelf.model('OurTeam',{

    hasTimestamps : true,

    tableName : 'our_teams',
});