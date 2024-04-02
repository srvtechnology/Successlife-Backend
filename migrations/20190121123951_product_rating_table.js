
exports.up = function(knex, Promise) {
    return knex.schema.createTable('product_ratings', function (table) {
        table.increments();
        table.string('ratingable_type');
        table.integer('ratingable_id').unsigned();
        table.decimal('rating',2,1).defaultTo(0.0);
        table.integer('user_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('product_ratings');
};

