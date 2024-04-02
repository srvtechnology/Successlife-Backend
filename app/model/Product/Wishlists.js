
const bookshelf= Config('database');

module.exports = bookshelf.model('Wishlists',{

    hasTimestamps : true,

    tableName : 'wishlists',

    user : function(){
        return this.belongsTo(( Model('User')));
    },

    product_details : function(){
        return this.morphTo( 'wishlistable' ,            
                Model('Product/Product'),
                Model('Course/Course')           
        );
    }
});

 