
exports.up = function(knex, Promise) {
    return knex.schema.createTable('provider_accounts', function (table) {
        table.increments();
        table.string('provider');
        table.string('provider_id');
        table.integer('user_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('provider_accounts');
};
