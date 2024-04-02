
exports.up = function(knex, Promise) {
    return knex.schema.createTable('payment_categories', function (table) {
        table.increments();
        table.string('title').nullable();        
        table.text('description').nullable();   
        table.boolean('is_active').defaultTo(false); 
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('payment_categories');  
};
