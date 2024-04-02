
exports.up = function(knex, Promise) {
    return knex.schema.createTable('product_offers', function (table) {
        table.increments();
        table.string('offerable_type');
        table.integer('offerable_id').unsigned();
        table.enu('discount_mode',['percentage','fixed']);
        table.decimal('discount',10,2).defaultTo(0.0);
        table.timestamp('started_on').nullable();
        table.timestamp('ended_on').nullable();
        table.boolean('is_expired').defaultTo(0);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('product_offers');
};

