
exports.up = function(knex) {
    return knex.schema.createTable('products', function (table) {
        table.increments();
        table.string('title');
        table.string('slug').unique();
        table.text('description','longtext');
        table.text('short_description','longtext');        
        table.decimal('discount').comment('in Percentage');
        table.string('currency',4);
        table.enu('product_type',['product','event_ticket']).defaultTo('product');
        table.enu('status',['draft','publish','unpublish']).defaultTo('draft');
        table.integer('user_id').unsigned();   
        table.boolean('is_fast_selling').defaultTo(false);
        table.boolean('is_featured').defaultTo(false);
        table.decimal('rating',3,2).defaultTo(0.0);
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('products');
};
