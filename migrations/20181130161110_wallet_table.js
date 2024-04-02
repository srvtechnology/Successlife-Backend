
exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('wallets', function (table) {
        table.increments();
        table.integer('user_id').unsigned();
        table.decimal('amount').defaultTo(0);
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('wallets');
};
