
exports.up = function(knex, Promise) {
    return knex.schema.createTable('ticket_comments', function (table) {
        table.increments();
        table.text('comment',['longtext']);
        table.enu('comment_mode',['comment','reply']);
        table.integer('ticket_support_id').unsigned();
        table.integer('commenter_id').unsigned();
        table.timestamps();

        table.foreign('ticket_support_id').references('ticket_supports.id').onDelete('CASCADE');
        table.foreign('commenter_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('ticket_comments')
};