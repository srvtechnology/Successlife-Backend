
exports.up = function(knex, Promise) {
    return knex.schema.createTable('reviews', function (table) {
        table.increments();
        table.string('reviewable_type');
        table.integer('reviewable_id').unsigned();
        table.string('experience');
        table.string('review_note');
        table.integer('rating_id').unsigned();
        table.integer('user_id').unsigned();
        table.timestamps();

        table.foreign('rating_id').references('ratings.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('reviews');
};
