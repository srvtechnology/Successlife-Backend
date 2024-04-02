
const bookshelf= Config('database');

module.exports = bookshelf.model('Favourites',{

    hasTimestamps : true,

    tableName : 'favourites',

    user : function(){
        return this.belongsTo( Model('User'),'user_id');
    },
    product_details : function(){
        return this.morphTo( 'favouriteable' ,            
                Model('Product/Product'),
                Model('Course/Course')           
        );
    }
});