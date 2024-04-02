
exports.up = function(knex) {
    return knex.schema.createTable('permissions', function (table) {
        table.increments();
        table.string('name').unique();
        table.string('display_name');
        table.integer('module_id').unsigned();
        table.timestamps();

        table.foreign('module_id').references('modules.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('permissions');
};
