
const bookshelf= Config('database');

module.exports = bookshelf.model('Orders',{

    hasTimestamps : true,

    tableName : 'orders', 

    user : function(){
        return this.belongsTo( Model('User'),'user_id');
    },
    order_address : function(){
        return this.belongsTo( Model('Order/OrderAddress'),'order_address_id');
    },
    order_details : function(){
        return this.hasMany( Model('Order/OrderDetails'),'order_id');
    },
    order_payments: function(){
        return this.hasMany( Model('OrderPayment'),'order_id');
    }
}); 