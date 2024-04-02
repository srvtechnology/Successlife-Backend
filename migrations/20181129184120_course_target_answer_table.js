
exports.up = function(knex) {
    return knex.schema.createTable('course_target_answers', function (table) {
        table.increments();
        table.text('answer',['longtext']);
        table.integer('course_id').unsigned();
        table.integer('course_target_id').unsigned();
        table.timestamps();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        table.foreign('course_target_id').references('course_targets.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_target_answers');
};
