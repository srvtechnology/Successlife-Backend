
exports.up = function(knex) {
    return knex.schema.createTable('course_coupons', function (table) {
        table.increments();
        table.string('coupon_code');
        table.enu('discount_mode',['percentage','fixed']);
        table.decimal('discount_value');
        table.decimal('max_discount');
        table.integer('use_per_user').defaultTo(0).comment('0 for unilimited');
        table.integer('max_use').defaultTo(0).comment('0 for unilimited');
        table.timestamp('started_on').nullable();
        table.timestamp('ended_on').nullable();
        table.integer('course_id').unsigned();
        table.integer('created_by').unsigned();
        table.timestamps();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        table.foreign('created_by').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_coupons');
};
