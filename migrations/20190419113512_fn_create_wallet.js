const fnName = 'fn_create_wallet';
const fnCredentials = '`matkol2061`@`%`';
const fnCreateWallet = 
`CREATE DEFINER=${fnCredentials} FUNCTION ${fnName}(
    input_number int
    ) RETURNS int(11)
    BEGIN  
        DECLARE walletID INT;     
       
        INSERT INTO wallets ('id','user_id') VALUES (id,input_number);
   
        SET walletID = LAST_INSERT_ID();    
        
        RETURN walletID;
    
    END`;

exports.up = function(knex, Promise) {
    return knex.raw(fnCreateWallet)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP VIEW IF EXISTS ${fnName}`);
};
