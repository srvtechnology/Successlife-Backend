
exports.up = function(knex) {
    return knex.schema.createTable('order_addresses', function (table) {
        table.increments();        
        table.string('address');
        table.enu('type',['home','office','others']).defaultTo('home');
        table.string('postcode');
        table.boolean('is_default').defaultTo(false);
        table.integer('user_id').unsigned();
        table.integer('country_id').unsigned();
        table.integer('state_id').unsigned();
        table.integer('city_id').unsigned();
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('country_id').references('countries.id').onDelete('CASCADE');
        table.foreign('state_id').references('states.id').onDelete('CASCADE');
        table.foreign('city_id').references('cities.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('order_addresses');
};
