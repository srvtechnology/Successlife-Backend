
exports.up = function(knex, Promise) {
    return knex.schema.createTable('cities', function (table) {
        table.increments();
        table.string('name');
        table.integer('state_id').unsigned();

        table.foreign('state_id').references('states.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('cities');
};
