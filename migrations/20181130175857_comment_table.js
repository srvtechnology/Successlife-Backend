
exports.up = function(knex) {
    return knex.schema.createTable('comments', function (table) {
        table.increments();
        table.text('comment','longtext');
        table.string('commentable_type');
        table.integer('commentable_id').unsigned();
        table.integer('user_id').unsigned();   
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('comments');
};
