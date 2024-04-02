const fnName = 'fn_check_wallet';
const fnCredentials = '`matkol2061`@`%`';
const fnCheckWallet = 
`CREATE DEFINER=${fnCredentials} FUNCTION ${fnName}(
    input_number int
    ) RETURNS int(11)
    BEGIN  
        DECLARE walletID INT;     
       
            SET walletID = (SELECT id from wallets where user_id = input_number);
        
        
        RETURN walletID;
    
    END`;

exports.up = function(knex, Promise) {
    return knex.raw(fnCheckWallet)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP VIEW IF EXISTS ${fnName}`);
};
