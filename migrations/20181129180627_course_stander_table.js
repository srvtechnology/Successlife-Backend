
exports.up = function(knex, Promise) {
    return knex.schema.createTable('course_standers', function (table) {
        table.increments();
        table.string('title');
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('course_standers')
};