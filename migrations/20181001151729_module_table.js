
exports.up = function(knex, Promise) {
    return knex.schema.createTable('modules', function (table) {
        table.increments();
        table.string('name');
        table.string('slug').unique();
        table.boolean('is_active').defaultTo(false);
        table.boolean('is_ticket_enable').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('modules');
};
