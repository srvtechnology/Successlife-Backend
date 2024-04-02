
exports.up = function(knex, Promise) {
    return knex.schema.createTable('states', function (table) {
        table.increments();
        table.string('name');
        table.integer('country_id').unsigned();

        table.foreign('country_id').references('countries.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('states');
};
