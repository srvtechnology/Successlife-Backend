
exports.up = function(knex, Promise) {
    return knex.schema.createTable('countries', function (table) {
        table.increments();
        table.string('name');
        table.string('code',4).unique();
        table.integer('phone_code').nullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('countries');
};
