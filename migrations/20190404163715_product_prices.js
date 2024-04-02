
exports.up = function(knex, Promise) {
    return knex.schema.createTable('product_prices', function(table){
        table.increments();
        table.integer('pricable_id').unsigned();
        table.enu('pricable_type',['courses','products']).unsigned();
        table.integer('pricable_type').unsigned();
        table.integer('payment_type_id').unsigned();
        table.integer('payment_category_id').unsigned();
        table.decimal('total_price').defaultTo(0.00);
        table.decimal('sxl_price').defaultTo(0.00);
        table.decimal('usd_price').defaultTo(0.00);
        table.decimal('sxl_to_usd_rate').defaultTo(0.00);
        table.integer('quantity').unsigned();       
  });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('product_prices');  
};
