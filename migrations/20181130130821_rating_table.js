
exports.up = function(knex, Promise) {
    return knex.schema.createTable('ratings', function (table) {
        table.increments();
        table.string('title');
        table.integer('count');
        table.string('color_code');
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('ratings');
};
