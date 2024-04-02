
exports.up = function(knex, Promise) {
    return knex.schema.createTable('images', function (table) {
        table.increments();
        table.string('imagable_type');
        table.integer('imagable_id').unsigned();
        table.string('small').nullable();
        table.string('thumbnail').nullable();
        table.string('banner').nullable();
        table.string('large').nullable();
        table.string('original');
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('images');
};

