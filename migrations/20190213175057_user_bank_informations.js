
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_bank_informations', function (table) {
        table.increments();
        table.integer('user_id').unsigned();  
        table.string('bank_name').nullable();
        table.string('branch_name').nullable();
        table.text('branch_address').nullable();
        table.string('branch_code').nullable();
        table.string('account_no').nullable();
        table.string('account_holder_name').nullable();
        table.enu('account_type',['Savings Account',  'Current Accounts',  'Salary Accounts',  'Deposits', 'Safe Deposit Locker',  'Rural Accounts' ,'Regular Savings','Recurring Deposit Account','Fixed Deposit Account','DEMAT Account','NRI Accounts']).defaultTo('Savings Account');       
        table.string('wire_transfer_code').nullable();
        table.boolean('is_default').defaultTo(false);        
        table.timestamps();

        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};  

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('user_bank_informations');
};
