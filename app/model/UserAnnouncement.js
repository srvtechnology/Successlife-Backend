
const bookshelf= Config('database');

module.exports = bookshelf.model('UserAnnouncement',{

    hasTimestamps : true,

    tableName : 'user_announcements',

    user : function(){
        return this.belongsTo(Model('User'),'user_id')
    }
});