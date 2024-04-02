
exports.up = function(knex, Promise) {
    
    return knex.schema.createTable('wallet_transactions', function (table) {
        table.increments();
        table.string('transactionable_type');
        table.integer('transactionable_id').unsigned();
        table.text('description','longtext').nullable();
        table.enu('type',['credit','debit']).defaultTo('debit');
        table.decimal('amount').defaultTo(0.0);
        table.enu('status',['complete','pending','cancel']).defaultTo('pending');
        table.integer('wallet_id').unsigned();
        table.timestamps();

        table.foreign('wallet_id').references('wallets.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('wallet_transactions');
};
