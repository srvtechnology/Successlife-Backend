
exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('user_course_progresses', function (table) {
        table.increments();
        table.integer('user_id').unsigned();
        table.integer('course_id').unsigned();
        table.integer('user_course_id').unsigned();
        table.integer('course_module_id').unsigned();
        table.integer('course_lecture_id').unsigned();
        table.boolean('is_complete').defaultTo(false);
        table.string('read_time').nullable();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        table.foreign('user_course_id').references('user_courses.id').onDelete('CASCADE');
        table.foreign('course_module_id').references('course_modules.id').onDelete('CASCADE');
        table.foreign('course_lecture_id').references('course_lectures.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('user_course_progresses');
};
