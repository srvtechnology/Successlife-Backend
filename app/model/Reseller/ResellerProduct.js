
const bookshelf= Config('database');

module.exports = bookshelf.model('ResellerProduct',{

    hasTimestamps : true,

    tableName : 'reseller_product',

    courses : function(){
        return this.belongsTo( Model('Course/Course'),'product_id');
    },

    reseller : function(){
        return this.belongsTo( Model('User'), 'user_id');
    }
});