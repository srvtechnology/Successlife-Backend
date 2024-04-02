
exports.up = function(knex) {
    return knex.schema.createTable('reseller_product', function (table) {
        table.increments();
        table.integer('product_id').unsigned();
        table.integer('user_id').unsigned();
        table.text('affiliated_link',['longtext']);
        table.enu('status',['active', 'inactive', 'expire']).defaultTo('active');
        table.boolean('is_delete').defaultTo(false);
        table.integer('approved_by').unsigned();
        table.timestamp('approved_date').nullable();
        table.boolean('is_approved').defaultTo(false);
        table.timestamps();

        table.foreign('product_id').references('products.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('reseller_product');
};
