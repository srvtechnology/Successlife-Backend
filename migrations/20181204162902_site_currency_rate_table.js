
exports.up = function(knex, Promise) {
    return knex.schema.createTable('site_currency_rates', function (table) {
        table.increments();
        table.string('base_currency').defaultTo('USD');
        table.string('converted_currency').defaultTo('USD');
        table.decimal('conversion_rate').defaultTo(1);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('site_currency_rates');
};
