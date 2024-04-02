
exports.up = function(knex, Promise) {
    return knex.schema.createTable('review_options', function (table) {
        table.increments();
        table.string('title');
        table.integer('review_question_id').unsigned();
        table.timestamps();

        table.foreign('review_question_id').references('review_questions.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('review_options');
};
