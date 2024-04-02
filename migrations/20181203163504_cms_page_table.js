
exports.up = function(knex, Promise) {
    return knex.schema.createTable('cms_pages', function (table) {
        table.increments();
        table.string('name');
        table.string('slug').unique();
        table.string('title');
        table.text('content','longtext');
        table.text('sample_content','longtext');
        table.text('description','longtext');
        table.text('keywords','longtext');
        table.text('css_class','longtext').nullable();
        table.string('icon').nullable();
        table.boolean('is_active').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('cms_pages');
};
