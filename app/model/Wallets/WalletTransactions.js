
const bookshelf= Config('database');

module.exports = bookshelf.model('WalletTransactions',{

    hasTimestamps : true,

    tableName : 'wallet_transactions',

    wallet:function(){
        return this.belongsTo(Model('Wallets/Wallets'),'wallet_id');
    },
    details : function(){
        return this.morphTo( 'transactionable' ,
                Model('Course/Course'),            
                Model('Order/Orders'),
                Model('Payout'),           
                Model('Course/UserCourse'),
                Model('Product/Product'),
        );
    },
});