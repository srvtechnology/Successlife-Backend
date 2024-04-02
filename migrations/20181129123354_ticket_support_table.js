
exports.up = function(knex, Promise) {
    return knex.schema.createTable('ticket_supports', function (table) {
        table.increments();
        table.string('ticket_number').unique();
        table.string('ticket_supportable_type');
        table.string('ticket_supportable_id');
        table.string('title');
        table.text('description',['longtext']);
        table.string('attachment').nullable();
        table.enu('priority_level',['low','medium','high']);
        table.integer('ticket_category_id').unsigned();
        table.integer('created_by').unsigned();
        table.integer('created_for').unsigned();
        table.integer('closed_by').unsigned().nullable();
        table.timestamp('closed_at').nullable();
        table.boolean('is_closed').defaultTo(false);
        table.timestamps();

        table.index('ticket_number');
        table.foreign('created_by').references('users.id').onDelete('CASCADE');
        table.foreign('created_for').references('users.id').onDelete('CASCADE');
        table.foreign('closed_by').references('users.id').onDelete('CASCADE');
        table.foreign('ticket_category_id').references('ticket_categories.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTableIfExists('ticket_supports')
};