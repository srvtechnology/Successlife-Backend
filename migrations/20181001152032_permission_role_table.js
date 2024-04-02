
exports.up = function(knex) {
    return knex.schema.createTable('permission_role', function (table) {
        table.increments();
        table.integer('role_id').unsigned();
        table.integer('permission_id').unsigned();

        table.foreign('role_id').references('roles.id').onDelete('CASCADE');
        table.foreign('permission_id').references('permissions.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('permission_role');
};
