
exports.up = function(knex) {
    return knex.schema.createTable('report_abuses', function (table) {
        table.increments();
        table.string('title');
        table.timestamps();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('report_abuses');
};
