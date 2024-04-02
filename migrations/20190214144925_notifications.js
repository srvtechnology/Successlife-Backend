
exports.up = function(knex, Promise) {
    return knex.schema.createTable('notifications', function (table) {
        table.increments();
        table.integer('entity_id').unsigned();  
        table.string('entity_type').nullable();
        table.text('data').nullable();
        table.integer('sender_id').defaultTo(false);         
        table.enu('role',['vendor','admin','all','customer']).defaultTo('admin'); 
        table.enu('type',['manual','system_generated',]).defaultTo('manual');              
        table.boolean('is_delete').defaultTo(false);        
        table.timestamps();        
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('notifications');
};
 