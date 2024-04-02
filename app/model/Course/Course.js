const bookshelf= Config('database');

module.exports = bookshelf.model('Course',{

    hasTimestamps : true,

    tableName : 'courses',

    //hidden : ['reviews'],

    user : function(){
        return this.belongsTo(Model('User'),'created_by');
    },

    categories : function(){
        return this.belongsToMany( Model('Category'), 'category_course');
    },

    course_modules:function(){
        return this.hasMany(Model('Course/CourseModule'));
    },

    course_coupons : function(){
        return this.hasMany(Model('Course/CourseCoupon'));
    },

    favourites: function(){
        return this.morphMany( Model('Product/Favourites'),'favouriteable' );
    },

    images : function(){ 
        return this.morphOne(Model('Images'),'imagable');
    },

    // offers: function(){
    //     return this.morphOne(Model('ProductOffer'),'offerable'); 
    // },
    
    reviews: function(){
        return this.morphMany( Model('Review/Reviews'),'reviewable' );
    },
    whislist: function(){
        return this.hasOne( Model('Product/Wishlists'),'wishlistable_id' );
    },
    course_standers : function(){
        return this.belongsTo( Model('Course/CourseStander'),'course_stander_id');
    },

    course_promotions: function(){
        return this.hasOne( Model('Course/CoursePromotions'),'course_id');
    },

    offer: function(){
        return this.hasOne( Model('ProductOffer'),'offerable_id');
    },

    // reseller_product: function(){
    //     return this.belongsTo( Model('Reseller/ResellerProduct'), 'product_id');
    // },

    virtuals: {
        parent_category_id: function() {
            if(this.related('categories')){
                let categories = this.related('categories');
                let parent_cat = categories.toJSON().filter(v => (v.parent_id == 0) );

                if(_.head(parent_cat)){
                   return _.head(parent_cat).id;
                }
            }
        },

        child_category_id: function() {
            if(this.related('categories')){
                let categories = this.related('categories');
                let child_cat = categories.toJSON().filter(v => (v.parent_id > 0) );

                if(_.head(child_cat)){
                    return _.head(child_cat).id;
                }
            }
        },

        avg_reviews : function(){
            let reviews = this.related('reviews');               
            if(reviews){              
                return reviews.toJSON().length || 0;
            }
        }
    },
    // user_course : function(){   
    //     return this.belongsTo( Model('Course/Course'),'course_id');
    // } ,
    user_course : function(){   
        return this.hasMany( Model('Course/UserCourse'),'course_id');
    }, 
    pricable: function(){
        return this.morphMany( Model('ProductPrice'),'pricable' );
    },
    order_details: function(){
        return this.hasMany( Model('Order/OrderDetails'),'productable_id' );
    }
}); 