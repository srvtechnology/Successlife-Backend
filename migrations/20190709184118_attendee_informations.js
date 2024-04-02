
exports.up = function(knex) {
    return knex.schema.createTable('attendee_informations', function (table) {
        table.increments();
        table.integer('event_id');        
        table.integer('order_id');        
        table.integer('user_id');        
        table.integer('payment_category_id');  
        table.timestamp('ticket_sent_date');  
        table.boolean('ticket_sent_status').defaultTo(false);
        table.boolean('attendee').defaultTo(false);        

        table.foreign('event_id').references('product_events.id').onDelete('CASCADE');
        table.foreign('user_id').references('orders.id').onDelete('CASCADE');
        table.foreign('order_id').references('users.id').onDelete('CASCADE');
       
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('attendee_informations');
};
