const bookshelf   = Config('database');

module.exports    = bookshelf.model('Permission',{

    hasTimestamps : true,

    tableName : 'permissions',

    roles : function(){
        return this.belongsToMany(Model('Role'),'permission_role');
    },

});