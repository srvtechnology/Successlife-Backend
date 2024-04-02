
const bookshelf= Config('database');

module.exports = bookshelf.model('Comments',{

    hasTimestamps : true,

    tableName : 'comments',

    user:function(){
        return this.belongsTo(Model('User'));
    },
    product_details : function(){
        return this.morphTo( 'commentable' ,            
                Model('Product/Product'),
                Model('Course/Course')           
        );
    }
});