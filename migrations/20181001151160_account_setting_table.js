
exports.up = function(knex, Promise) {
    return knex.schema.createTable('account_settings', function (table) {
        table.increments();
        table.string('currency');
        table.string('language');
        table.text('notification_settings',['longtext']).nullable();
        table.integer('user_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('account_settings');
};
