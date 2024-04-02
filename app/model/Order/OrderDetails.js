
const bookshelf= Config('database');

module.exports = bookshelf.model('OrderDetails',{

    hasTimestamps : false,

    tableName : 'order_details',

    customer : function(){
        return this.belongsTo( Model('User'),'user_id');
    },
    user : function(){
        return this.belongsTo( Model('User'),'vendor_id');
    },
    reseller_user : function(){
        return this.belongsTo( Model('User'),'reseller_id');
    },
    order : function(){
        return this.belongsTo( Model('Order/Orders'),'order_id');
    },
    course_coupon : function(){
        return this.belongsTo( Model('Course/CourseCoupon'),'course_coupon_id');
    },
    product_details : function(){
        return this.morphTo( 'productable' ,            
                Model('Product/Product'),
                Model('Course/Course'),
                Model('Course/CoursePromotions')        
        );
    },
    pricable_details: function(){
        return this.hasOne(Model('ProductPrice'),'pricable_id')
    },
    order_price_details: function(){
        return this.belongsTo(Model('ProductPrice'),'pricable_id')
    },
    payment_category: function(){
        return this.belongsTo(Model('PaymentCategory'),'payment_category_id')
    },
    payment_type: function(){
        return this.belongsTo(Model('PaymentType'),'payment_type_id')
    },
    product_events: function(){
        return this.belongsTo(Model('Product/Event'),'productable_id')
    },
    product:function(){
        return this.belongsTo(Model('Product/Product'),'productable_id')
    }
    
    
}); 