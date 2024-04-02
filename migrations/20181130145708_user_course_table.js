
exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('user_courses', function (table) {
        table.increments();
        table.text('section_data','longtext').nullable();
        table.text('lecture_data','longtext').nullable();
        table.enu('status',['enrolled','running','completed','expired','cancelled']).defaultTo('enrolled');
        table.integer('total_lecture').unsigned();
        table.integer('completed_lecture').unsigned().comment('in percentage');
        table.boolean('is_certificate_issued').defaultTo(false);
        table.boolean('is_archived').defaultTo(false);
        table.string('certificate_link');
        table.integer('user_id').unsigned();
        table.integer('course_id').unsigned();
        table.integer('order_id').unsigned();
        table.timestamp('certificate_issued_on').nullable();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('user_courses');
};
