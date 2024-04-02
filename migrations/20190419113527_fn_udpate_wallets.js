const fnName = 'fn_udpate_wallets';
const fnCredentials = '`matkol2061`@`%`';
const fnUpdateWallet = 
`CREATE DEFINER=${fnCredentials} FUNCTION ${fnName}(
    input_number int
    ) RETURNS int(11)
    BEGIN  
    update wallets as w, (
        SELECT wallet_id, (SUM(COALESCE(CASE WHEN type = "credit" THEN amount END,0)) 
        - SUM(COALESCE(CASE WHEN type = "debit" THEN amount END,0))) 
        balance  
        FROM wallet_transactions  
        GROUP BY wallet_id  ) as wt  SET w.amount = wt.balance 
        where wt.wallet_id = w.id;
         
         RETURN 1;
    
    END`;

exports.up = function(knex, Promise) {
    return knex.raw(fnUpdateWallet)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP VIEW IF EXISTS ${fnName}`);
};
