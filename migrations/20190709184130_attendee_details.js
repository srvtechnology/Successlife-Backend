
exports.up = function(knex) {
    return knex.schema.createTable('attendee_details', function (table) {
        table.increments();
        table.integer('attendee_id');        
        table.integer('country_id');        
        table.string('ticket_number');        
        table.string('first_name');  
        table.string('last_name');  
        table.string('email');
        table.string('phone_code');
        table.string('bar_code').nullable();
        table.string('qr_code').nullable();
        table.boolean('is_default').defaultTo(false); 

        table.foreign('attendee_id').references('attendee_informations.id').onDelete('CASCADE');
       
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('attendee_details');
};
