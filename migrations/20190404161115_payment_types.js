
exports.up = function(knex, Promise) {
    return knex.schema.createTable('payment_types', function(table){
        table.increments();
        table.enu('payment_types',[  'SXL',  'USD',  'USDSXL' ]).defaultTo('USD');       
        table.boolean('is_active').defaultTo(false); 
        table.timestamps();
  });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('payment_types');  
};
