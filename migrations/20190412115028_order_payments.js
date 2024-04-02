
exports.up = function(knex) {
    return knex.schema.createTable('order_payments', function (table) {
        table.increments();       
        table.integer('order_id').unsigned();
        table.enu('price_type',['USD', 'SXL', 'FREE']).defaultTo('FREE');
        table.enu('payment_mode',['W', 'CS', 'SXL', 'WCS', 'WSXL', 'FREE']).defaultTo('FREE');   
        table.enu('payment_status',['complete','cancel','pending','return','failed']).defaultTo('pending');   
        table.enu('payment_status',['complete','cancel','pending','return','failed']).defaultTo('pending');   
        table.text('send_data','longtext').nullable();
        table.text('received_data','longtext').nullable();
        table.decimal('amount');
        table.timestamp('payment_on').nullable();
        table.timestamps();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('order_payments');
};
