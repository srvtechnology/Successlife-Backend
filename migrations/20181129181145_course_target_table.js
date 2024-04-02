
exports.up = function(knex, Promise) {
    return knex.schema.createTable('course_targets', function (table) {
        table.increments();
        table.text('question',['longtext']);
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('course_targets')
};