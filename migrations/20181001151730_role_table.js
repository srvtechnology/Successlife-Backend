
exports.up = function(knex) {
    return knex.schema.createTable('roles', function (table) {
        table.increments();
        table.string('name').unique();
        table.string('display_name');
        table.boolean('is_single').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('roles');
};
