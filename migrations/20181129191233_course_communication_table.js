
exports.up = function(knex) {
    return knex.schema.createTable('course_communications', function (table) {
        table.increments();
        table.text('wellcome_template',['longtext']);
        table.text('congrats_template',['longtext']);
        table.text('complete_template',['longtext']);
        table.integer('course_id').unsigned();         
        table.timestamps();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_communications');
};
