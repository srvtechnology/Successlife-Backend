
exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('wishlists', function (table) {
        table.increments();
        table.integer('user_id').unsigned();
        table.string('wishlistable_type');
        table.integer('wishlistable_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('wishlists');
};
