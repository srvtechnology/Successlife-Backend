
const bookshelf= Config('database');

module.exports = bookshelf.model('Reviews',{

    hasTimestamps : true,

    tableName : 'reviews',

    user : function(){
        return this.belongsTo(Model('User'),'user_id');
    },
    rating : function(){
        return this.belongsTo(Model('Ratings'),'rating_id');
    },
    product_details : function(){
        return this.morphTo( 'reviewable' ,            
                Model('Product/Product'),
                Model('Course/Course')           
        );
    }
});