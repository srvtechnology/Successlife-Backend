
const bookshelf= Config('database');

module.exports = bookshelf.model('EventSpeakers',{

    hasTimestamps : true,

    tableName : 'event_speakers',

    product : function(){
        return this.belongsTo( Model('Product/Product'),'product_id');
    },
    user_created_by : function(){
        return this.belongsTo( Model('User'),'created_by');
    },
});