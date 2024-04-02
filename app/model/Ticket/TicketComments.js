
const bookshelf= Config('database');

module.exports = bookshelf.model('TicketComments',{

    hasTimestamps : true,

    tableName : 'ticket_comments',

    user : function(){
        return this.belongsTo( Model('User') ,'commenter_id');
    },
    ticket_support : function(){
        return this.belongsTo( Model('Ticket/TicketSupport'),'ticket_support_id');
    }
}); 