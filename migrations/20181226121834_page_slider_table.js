
exports.up = function(knex, Promise) {
    return knex.schema.createTable('page_sliders', function (table) {
        table.increments();
        table.string('page');
        table.string('title');
        table.string('content').nullable();
        table.string('thumbnail');
        table.string('button_1_title').nullable();
        table.string('button_2_title').nullable();
        table.string('button_1_link').nullable();
        table.string('button_2_link').nullable();
        table.boolean('is_active').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('page_sliders');
};
