
const bookshelf= Config('database');

module.exports = bookshelf.model('Payout',{

    hasTimestamps : true,

    tableName : 'payouts',
    
    wallet : function(){
        return this.belongsTo(Model('Wallets/Wallets'),'wallet_id')
    },
    user: function(){
        return this.belongsTo(Model('User'),'user_id')
    }
});