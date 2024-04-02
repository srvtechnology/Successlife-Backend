const walletTransactionModel = Model('Wallets/WalletTransactions');
const Bookshelf = Config('database');

const walletTransactionObj   = [];

const walletDetails = {
    
    walletTransactionObj,

    setDataObject: function(obj){        
        this.walletTransactionObj = obj;
        return this;
    },

    exec: async function(){
        let walletTransaction = _.isObject(this.walletTransactionObj) ? this.walletTransactionObj : false;

        return new Promise(function(resolve, reject) {

            if(walletTransaction){                
                new walletTransactionModel(walletTransaction)
                .save()
                .then((success)=>{
                    var rawQuery = `update wallets as w, ( SELECT wallet_id, (SUM(COALESCE(CASE WHEN type = "credit" THEN amount END,0)) - SUM(COALESCE(CASE WHEN type = "debit" THEN amount END,0))) balance  FROM wallet_transactions  GROUP BY wallet_id  ) as wt  SET w.amount = wt.balance where wt.wallet_id = w.id and w.id IN (${walletTransaction.wallet_id})`;                
                    return Bookshelf.knex.raw(rawQuery);
                })
                .then((walletUpdate)=>{
                    resolve(walletUpdate);
                })
                .catch((err)=>{
                    reject(err);
                })
            }
            else{
                reject('Data must be in object!');
            } 
        });
    }
}

module.exports = walletDetails;