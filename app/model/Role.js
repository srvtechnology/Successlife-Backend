const bookshelf   = Config('database');

module.exports = bookshelf.model('Role',{
    
    hasTimestamps : true,

    tableName : 'roles',
    
    permissions : function(){
        return this.belongsToMany(Model('Permission'),'permission_role');
    },

    users : function(){
        return this.belongsToMany(Model('User'),'role_user');
    },
});




