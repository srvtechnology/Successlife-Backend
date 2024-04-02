
const bookshelf= Config('database');

module.exports = bookshelf.model('TicketSupport',{

    hasTimestamps : true,

    tableName : 'ticket_supports',

    ticket_categories : function(){
        return this.belongsTo( Model('Ticket/TicketCategory'),'ticket_category_id');
    },
    product_details : function(){
        return this.morphTo( 'ticket_supportable' ,            
                Model('Product/Product'),
                Model('Course/Course')           
        );
    },
    created_by_user : function(){
        return this.belongsTo( Model('User'),'created_by');
    },
    created_for_user : function(){
        return this.belongsTo( Model('User'),'created_for');
    },
    closed_by_user : function(){
        return this.belongsTo( Model('User'),'closed_by');
    },
});