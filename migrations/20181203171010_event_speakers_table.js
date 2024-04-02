
exports.up = function(knex, Promise) {
    return knex.schema.createTable('event_speakers', function (table) {
        table.increments();
        table.string('name');
        table.string('avatar').nullable();
        table.string('about').nullable();
        // table.string('description').nullable();
        // table.integer('product_id').unsigned();
        table.integer('created_by').unsigned();
        table.boolean('is_active').defaultTo(false);    
        table.timestamps();

        table.foreign('product_id').references('products.id').onDelete('CASCADE');
        table.foreign('created_by').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('event_speakers');
};
