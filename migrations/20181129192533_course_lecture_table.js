
exports.up = function(knex) {
    return knex.schema.createTable('course_lectures', function (table) {
        table.increments();
        table.string('title');
        table.text('description',['longtext']).nullable();
        table.text('short_description',['longtext']).nullable();
        table.text('resources',['longtext']).nullable();
        table.enu('lecture_mode',['video','pdf']);
        table.string('lecture_link');
        table.integer('order_by').unsigned();   
        table.integer('course_module_id').unsigned();  
        table.string('duration').nullable();    
        table.timestamps();

        table.foreign('course_module_id').references('course_modules.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_lectures');
};
