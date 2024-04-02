
exports.up = function(knex) {
    return knex.schema.createTable('category_product_speakers', function (table) {
        table.increments();
        table.integer('product_id').unsigned();
        table.integer('category_product_speaker_id').unsigned();
        table.timestamps();        
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('category_product_speakers');
};
