
exports.up = function(knex, Promise) {
  return knex.schema.createTable('course_promotions', function(table){
        table.increments();
        table.integer('course_id').unsigned();
        table.integer('user_id').unsigned();
        table.integer('order_id').unsigned();
        table.timestamp('start_on');
        table.timestamp('end_on').nullable();
        table.enu('status',['active','inactive','expire']).defaultTo('expire');
        table.timestamps();

        table.foreign('course_id').references('courses.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('order_id').references('orders.id').onDelete('CASCADE');
  });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('course_promotions');
};
