
exports.up = function(knex) {
    return knex.schema.createTable('product_events', function (table) {
        table.increments();
        table.string('address');
        table.string('unique_event_id');
        table.integer('country_id').unsigned();
        table.integer('state_id').unsigned();
        table.integer('city_id').unsigned();
        table.integer('product_id').unsigned();
        table.timestamp('start_on');
        table.timestamp('end_on').nullable();
        table.text('banner_image').nullable();        
        table.timestamps();
        
        table.foreign('country_id').references('countries.id').onDelete('CASCADE');
        table.foreign('state_id').references('states.id').onDelete('CASCADE');
        table.foreign('city_id').references('cities.id').onDelete('CASCADE');
        table.foreign('product_id').references('products.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('product_events');
};
