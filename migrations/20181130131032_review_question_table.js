
exports.up = function(knex, Promise) {
    return knex.schema.createTable('review_questions', function (table) {
        table.increments();
        table.string('title');
        table.enu('review_area',['product','course','user']);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('review_questions');
};
