

exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('payouts', function (table) {
        table.increments();
        table.integer('wallet_id').unsigned();
        table.integer('user_id').unsigned();
        table.decimal('amount');
        table.string('description').nullable();
        table.enu('status',['complete','pending']).defaultTo('pending');        
        table.timestamp('generate_date').nullable();
        table.timestamp('approved_date').nullable();
        table.timestamps();

        table.foreign('wallet_id').references('wallets.id').onDelete('CASCADE');
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('payouts');
};
