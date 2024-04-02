
exports.up = function(knex, Promise) {
    return knex.schema.createTable('review_details', function (table) {
        table.increments();
        table.integer('review_id').unsigned();
        table.integer('review_question_id').unsigned();
        table.integer('review_option_id').unsigned();
        table.timestamps();

        table.foreign('review_id').references('reviews.id').onDelete('CASCADE');
        table.foreign('review_question_id').references('review_questions.id').onDelete('CASCADE');
        table.foreign('review_option_id').references('review_options.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('rating_details');
};
