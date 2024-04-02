const bookshelf   = Config('database');

module.exports = bookshelf.model('Module',{
    
    hasTimestamps : true,

    tableName : 'modules',

    permissions : function(){
        return this.hasMany(Model('Permission'));
    }
});

