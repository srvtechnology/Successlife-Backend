
exports.up = function(knex) {
    return knex.schema.createTable('course_report_abuses', function (table) {
        table.increments();
        table.string('title');
        table.text('description','longtext');
        table.integer('report_abuse_id').unsigned();
        table.integer('course_id').unsigned();
        table.integer('user_id').unsigned();
        table.timestamps();

        table.foreign('report_abuse_id').references('report_abuses.id').onDelete('CASCADE');
        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_report_abuses');
};
