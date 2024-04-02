
exports.up = function(knex, Promise) {
    return knex.schema.createTable('our_teams', function (table) {
        table.increments();       
        table.string('name').nullable();       
        table.string('designation').nullable();       
        table.text('image').nullable();       
        table.boolean('is_active').defaultTo(false);        
        table.timestamps();
       
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('our_teams');
};
 