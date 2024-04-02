
exports.up = function(knex) {
    return knex.schema.createTable('password_resets', function (table) {
        table.string('user_name').unique();
        table.string('token');
        table.timestamp('created_at').nullable();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('password_resets');
};
