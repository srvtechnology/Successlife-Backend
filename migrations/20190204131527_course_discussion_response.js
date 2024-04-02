
exports.up = function(knex, Promise) {

    return knex.schema.createTable('course_discussions_response', function (table) {
        table.increments();
        table.integer('user_id').unsigned();
        table.integer('course_discussions_id').unsigned();
        table.text('comments','longtext');        
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('course_discussions_id').references('course_discussions.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('course_discussions_response');
};
 