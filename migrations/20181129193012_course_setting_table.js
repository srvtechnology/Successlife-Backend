
exports.up = function(knex) {
    return knex.schema.createTable('course_settings', function (table) {
        table.increments();
        table.enu('visibility',['public','private','protected']);
        table.boolean('is_qa_enable').defaultTo(false);
        table.boolean('is_assignment_enable').defaultTo(false);
        table.boolean('is_review_enable').defaultTo(false);
        table.integer('course_id').unsigned();   
        table.timestamps();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_settings');
};
