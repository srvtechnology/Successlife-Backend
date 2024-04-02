
exports.up = function(knex) {
    return knex.schema.createTable('role_user', function (table) {
        table.increments();
        table.integer('role_id').unsigned();
        table.integer('user_id').unsigned();

        table.foreign('role_id').references('roles.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('role_user');
};
