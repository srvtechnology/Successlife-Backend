
exports.up = function(knex, Promise) {
    return knex.schema.createTable('site_settings', function (table) {
        table.increments();
        table.string('access_key').unique();
        table.string('value');
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('site_settings');
};
