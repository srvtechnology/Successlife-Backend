
const bookshelf= Config('database');

module.exports = bookshelf.model('Notification',{

    hasTimestamps : true,

    tableName : 'notifications',

    user: function(){
        return this.belongsTo(Model('User'),'sender_id');
    }
});