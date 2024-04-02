
const bookshelf= Config('database');

module.exports = bookshelf.model('TicketCategory',{

    hasTimestamps : true,

    tableName : 'ticket_categories',

    module : function(){
        return this.belongsTo( Model('Module'),'module_id');
    },
}); 