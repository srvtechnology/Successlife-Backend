
exports.up = function(knex, Promise) {

    return knex.schema.createTable('ticket_categories', function (table) {
        table.increments();
        table.string('name');
        table.integer('module_id').unsigned();
        table.boolean('is_active').defaultTo(false);
        table.timestamps();

        table.foreign('module_id').references('modules.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('ticket_categories')
};
