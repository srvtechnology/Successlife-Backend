
exports.up = function(knex) {
    return knex.schema.createTable('course_modules', function (table) {
        table.increments();
        table.string('title');
        table.text('description',['longtext']).nullable();
        table.text('short_description',['longtext']).nullable();
        table.text('resources',['longtext']).nullable();
        table.integer('order_by').unsigned();   
        table.integer('course_id').unsigned();         
        table.timestamps();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_modules');
};
