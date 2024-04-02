
exports.up = function(knex, Promise) {
    return knex.schema.createTable('profiles', function (table) {
        table.increments();
        table.string('first_name');
        table.string('middle_name').nullable();
        table.string('last_name');
        table.string('head_line');
        table.text('biography',['longtext']).nullable();
        table.text('social_links',['longtext']).nullable();
        table.string('ethereum_address').nullable();
        table.string('timezone');
        table.string('address').nullable();
        table.integer('country_id').unsigned();
        table.integer('state_id').unsigned();
        table.integer('city_id').unsigned();
        table.integer('user_id').unsigned();
        table.timestamps();

        table.foreign('country_id').references('countries.id').onDelete('CASCADE');
        table.foreign('state_id').references('states.id').onDelete('CASCADE');
        table.foreign('city_id').references('cities.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('profiles');
};
