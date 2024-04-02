
exports.up = function(knex) {
    return knex.schema.createTable('videos', function (table) {
        table.increments();
        table.integer('youtube_id').nullable();        
        table.enu('type',['events', 'courses', 'products']).nullable();
        table.integer('created_by').nullable();       
        table.boolean('is_active').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('videos');
};
