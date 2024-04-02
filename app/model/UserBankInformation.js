
const bookshelf= Config('database');

module.exports = bookshelf.model('UserBankInformation',{

    hasTimestamps : true,

    tableName : 'user_bank_informations',

    user: function(){
        return this.belongsTo(Model('User'),'user_id');
    }
}); 