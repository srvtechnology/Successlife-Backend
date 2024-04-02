
exports.up = function(knex) {
    return knex.schema.createTable('category_course', function (table) {
        table.increments();
        table.integer('course_id').unsigned();
        table.integer('category_id').unsigned();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        table.foreign('category_id').references('categories.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('category_course');
};
