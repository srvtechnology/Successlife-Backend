
exports.up = function(knex) {
    return knex.schema.createTable('category_product', function (table) {
        table.increments();
        table.integer('product_id').unsigned();
        table.integer('category_id').unsigned();
        table.timestamps();

        table.foreign('product_id').references('products.id').onDelete('CASCADE');
        table.foreign('category_id').references('categories.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('category_product');
};
