
exports.up = function(knex, Promise) {

    return knex.schema.createTable('categories', function (table) {
        table.increments();
        table.string('name');
        table.string('icon').nullable();
        table.enu('type',['courses','products','events']).nullable();
        table.text('description',['longtext']).nullable();
        table.integer('created_by').unsigned();
        table.string('slug').unique();
        table.integer('parent_id').unsigned();
        table.boolean('is_active').defaultTo(false);
        table.timestamps();
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('categories')
};
