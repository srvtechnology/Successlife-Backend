
const bookshelf= Config('database');

module.exports = bookshelf.model('ProductPrice',{

    hasTimestamps : false,

    tableName : 'product_prices',

    payment_category : function(){
        return this.belongsTo(Model('PaymentCategory'),'payment_category_id')
    },
    payment_type : function(){
        return this.belongsTo(Model('PaymentType'),'payment_type_id')
    },
    product_details : function(){
        return this.morphTo( 'pricable' ,            
                Model('Product/Product'),
                Model('Course/Course'),
                Model('Course/CoursePromotions')        
        );
    },
    order_details: function(){        
        return this.belongsTo(Model('Order/OrderDetails'),'order_id');
    }
});