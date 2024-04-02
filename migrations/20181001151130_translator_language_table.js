
exports.up = function(knex, Promise) {
    return knex.schema.createTable('translator_languages', function (table) {
        table.increments();
        table.string('locale');
        table.string('name');
        table.boolean('is_active').defaultTo(false);
        table.boolean('is_rtl').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('translator_languages');
};
