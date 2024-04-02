
exports.up = function(knex, Promise) {
    return knex.schema.createTable('reseller_product_logs', function (table) {
        table.increments();
        table.text('data').nullable();   
        table.integer('user_id').unsigned();
        table.integer('logable_id').unsigned();
        table.string('logable_type').nullable();
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('reseller_product_logs');  
};
