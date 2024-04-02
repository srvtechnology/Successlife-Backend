
const bookshelf= Config('database');

module.exports = bookshelf.model('OrderAddress',{

    hasTimestamps : true,

    tableName : 'order_addresses',

    user : function(){
        return this.belongsTo( Model('User'),'user_id');
    },
    country : function(){
        return this.belongsTo( Model('Location/Country'),'country_id');
    },
    city : function(){
        return this.belongsTo( Model('Location/City'),'city_id');
    },
    state : function(){
        return this.belongsTo( Model('Location/State'),'state_id');
    },
}); 