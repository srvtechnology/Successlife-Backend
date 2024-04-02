
exports.up = function(knex) {
    return knex.schema.createTable('user_announcements', function (table) {
        table.increments();
        table.string('title');
        table.string('slug').unique();
        table.text('description','longtext');
        table.integer('user_id').unsigned();   
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user_announcements');
};
