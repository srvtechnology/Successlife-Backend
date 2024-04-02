

exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('course_discussions', function (table) {
        table.increments();
        table.string('title');
        table.string('slug').unique();
        table.text('description','longtext');
        table.integer('user_id').unsigned();
        table.integer('course_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('course_discussions');
};
