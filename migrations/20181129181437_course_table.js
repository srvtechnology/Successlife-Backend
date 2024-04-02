
exports.up = function(knex, Promise) {
    return knex.schema.createTable('courses', function (table) {
        table.increments();
        table.string('title');
        table.string('slug').unique();
        table.string('sub_title').nullable();
        table.text('description',['longtext']).nullable();
        table.string('primary_thought').nullable()
        table.string('promotional_video').nullable();
        table.decimal('duration').defaultTo(0.00);
        table.decimal('price').nullable();
        table.string('currency',4).defaultTo('USD');
        table.integer('created_by').unsigned();
        table.integer('created_for').unsigned();
        table.integer('course_stander_id').unsigned().nullable();
        table.integer('course_time_id').unsigned();
        table.enu('status',['draft','publish','unpublish']).defaultTo('draft');
        table.string('locale').defaultTo('en')
        table.decimal('rating',3,2).defaultTo(0.0);
        table.boolean('mail_status').defaultTo(false);
        table.boolean('is_active').defaultTo(true);
        table.boolean('is_delete').defaultTo(false);
        table.timestamps();

        table.foreign('created_by').references('users.id').onDelete('CASCADE');
        table.foreign('created_for').references('users.id').onDelete('CASCADE');
        table.foreign('course_stander_id').references('course_standers.id').onDelete('CASCADE');
        table.foreign('course_time_id').references('course_times.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('courses')
};