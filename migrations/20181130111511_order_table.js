
exports.up = function(knex) {
    return knex.schema.createTable('orders', function (table) {
        table.increments();
        table.integer('user_id').unsigned();        
        table.integer('reseller_id').unsigned();      
        table.integer('order_address_id').unsigned();  
        table.string('slx_address').nullable(); 
        table.decimal('total_discount_price').defaultTo(0);                
        table.decimal('total_order_price_usd');
        table.decimal('total_order_price_sxl');
        table.decimal('total_order_price');
        table.timestamp('ordered_on');
        table.boolean('is_delete').defaultTo(false);  
        table.enu('order_status',['complete','cancel','pending','return']).defaultTo('pending');

        // table.enu('payment_mode',['C',  'W',  'CS',  'SLX',  'WCS',  'WSLX']).defaultTo('C');
        // table.enu('payment_status',['complete','cancel','pending','return']).defaultTo('pending');
        // table.text('send_data','longtext').nullable();
        // table.text('received_data','longtext').nullable();
        // table.timestamp('payment_status_update_on').nullable();
        // table.timestamp('order_status_update_on').nullable();
        // table.string('transaction_id').nullable();
        
        
        table.timestamps();

        //table.foreign('user_id').references('users.id').onDelete('CASCADE');
        //table.foreign('order_address_id').references('order_addresses.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('orders');
};
