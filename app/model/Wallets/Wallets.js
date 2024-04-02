
const bookshelf= Config('database');

module.exports = bookshelf.model('Wallets',{

    hasTimestamps : true,

    tableName : 'wallets',

    user:function(){
        return this.belongsTo(Model('User'),'user_id');
    },
    wallet_transactions:function(){
        return this.hasMany(Model('Wallets/WalletTransactions'),'wallet_id');
    },
}); 