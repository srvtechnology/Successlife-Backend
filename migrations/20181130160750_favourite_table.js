
exports.up = function(knex,Promise) {
    
    return knex.schema.createTable('favourites', function (table) {
        table.increments();
        table.integer('user_id').unsigned();
        table.string('favouriteable_type');
        table.integer('favouriteable_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('favourites');
};
