const spName = 'sp_create_wallet';
const spCredentials = '`matkol2061`@`%`';
const storedProcedureCreateWallet = 
`CREATE DEFINER=${spCredentials} PROCEDURE ${spName}(
	IN orderId INTEGER(10),
	IN vendorCommission INTEGER(10),
	IN resellerCommission INTEGER(10),
    IN walletDescription TEXT
)
BEGIN 

DECLARE commission_amount float;
DECLARE reseller_amount float;
DECLARE admin_amount float;

DECLARE done INT DEFAULT FALSE;
DECLARE reseller_id,vendor_id,productable_id INT; 
DECLARE totalAmount decimal;
DECLARE productable_type varchar(255);

DECLARE resellerWalletId INT;
DECLARE vendorWalletId INT;
DECLARE updateWallet INT;

DECLARE wallet_cursor CURSOR FOR 
SELECT order_details.reseller_id,order_details.vendor_id,order_details.productable_id,
sum(
	( ('total_sxl'*'sxl_to_usd_rate')+'total_usd')  * order_details.quantity
	) AS totalAmount,order_details.productable_type 
FROM  'order_details'
WHERE order_details.order_id =orderId
GROUP BY order_details.vendor_id, order_details.reseller_id;

 -- declare NOT FOUND handler
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
   
OPEN wallet_cursor;

read_loop: LOOP
	FETCH wallet_cursor INTO reseller_id,vendor_id,productable_id,totalAmount,productable_type;
    IF done THEN   
		SET updateWallet = fn_udpate_wallets();		       
		LEAVE read_loop;
    END IF;
	
     set commission_amount = ( totalAmount * vendorCommission ) / 100;
     
		SET vendorWalletId = fn_check_wallet(vendor_id);
        
        IF(vendorWalletId IS NULL) THEN	
		
			SET vendorWalletId = fn_create_wallet(vendor_id);
		
		END IF;      
        
        IF(reseller_id IS NOT NULL) THEN	
        
			SET resellerWalletId = fn_check_wallet(reseller_id);
        
			IF(resellerWalletId IS NULL) THEN	
			
				SET resellerWalletId = fn_create_wallet(reseller_id);
			
			END IF;      
        
        END IF;      
	
		
        IF(reseller_id IS NOT NULL) THEN	
			
            set reseller_amount = ( commission_amount * resellerCommission ) / 100;
            set admin_amount = commission_amount - reseller_amount; 
            
			INSERT INTO wallet_transactions ('transactionable_type','transactionable_id','description','amount','type','status','wallet_id') 
            VALUES(productable_type,productable_id,walletDescription,reseller_amount,'credit','complete',resellerWalletId);    
        
			# vendor 
			INSERT INTO wallet_transactions ('transactionable_type','transactionable_id
			,'description','amount','type','status','wallet_id') 
			VALUES(productable_type,productable_id,walletDescription,commission_amount,'credit','complete',vendorWalletId);
            
            # sr admin
            INSERT INTO wallet_transactions ('transactionable_type','transactionable_id','description','amount','type','status','wallet_id') 
            VALUES(productable_type,productable_id,walletDescription,admin_amount,'credit','complete',1);            
           
            
        ELSE
			# vendor 
			INSERT INTO wallet_transactions ('transactionable_type','transactionable_id','description','amount','type','status','wallet_id') 
			VALUES(productable_type,productable_id,walletDescription,commission_amount,'credit','complete',vendorWalletId);
        
			# sr admin
            INSERT INTO wallet_transactions ('transactionable_type','transactionable_id','description','amount','type','status','wallet_id') 
            VALUES(productable_type,productable_id,walletDescription,commission_amount,'credit','complete',1);        
            
        END IF;         
        
	END LOOP;
    
CLOSE wallet_cursor; 

END`;

exports.up = function(knex, Promise) {
    return knex.raw(storedProcedureCreateWallet)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP PROCEDURE IF EXISTS ${spName}`);
};
