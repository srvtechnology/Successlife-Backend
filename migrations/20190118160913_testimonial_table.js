
exports.up = function(knex, Promise) {
    return knex.schema.createTable('testimonials', function (table) {
        table.increments();
        table.string('name');
        table.string('education').nullable();
        table.string('avatar');
        table.text('description',['longtext']);
        table.boolean('is_active').defaultTo(0);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('testimonials');
};
