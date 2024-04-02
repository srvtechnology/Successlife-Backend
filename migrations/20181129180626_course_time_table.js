
exports.up = function(knex) {
    return knex.schema.createTable('course_times', function (table) {
        table.increments();
        table.string('name');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('course_times');
};
