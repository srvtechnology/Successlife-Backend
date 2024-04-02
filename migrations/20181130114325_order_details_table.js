
exports.up = function(knex) {
    return knex.schema.createTable('order_details', function (table) {
        table.increments();
        table.string('productable_type');
        table.integer('productable_id').unsigned();
        table.integer('payment_category_id').unsigned();
        table.integer('order_id').unsigned();
        table.integer('vendor_id').unsigned();
        table.integer('reseller_id').unsigned().defaultTo(0);
        table.string('couponable_type');
        table.integer('couponable_id').unsigned();
        table.integer('quantity').unsigned();
        table.decimal('sub_total_usd');
        table.decimal('discount_usd');
        table.decimal('total_usd');
        table.decimal('sub_total_sxl');
        table.decimal('discount_sxl');
        table.decimal('total_sxl');
        table.timestamps();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('order_details');
};
