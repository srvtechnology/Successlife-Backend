
const bookshelf= Config('database');

module.exports = bookshelf.model('Product',{

    hasTimestamps : true,

    tableName : 'products',

   hidden : ['reviews'],

    virtuals: {       
        avg_reviews : function(){
            let reviews = this.related('reviews');           
            if(reviews){                     
                return reviews.toJSON().length || 0;
            }
        }
    }, 

    categories : function(){
        return this.belongsToMany( Model('Category'), 'category_product');
    },

    event_speakers: function(){
        return this.belongsToMany( Model('EventSpeakers'), 'category_product_speakers');
    },
    images : function(){
        return this.hasMany( Model('Images'),'imagable_id');
    },

    user : function(){
        return this.belongsTo( Model('User'),'user_id');
    },

    event : function(){
        return this.hasOne( Model('Product/Event'),'product_id');
    },
    
    order_details: function(){
        return this.morphMany( Model('Order/OrderDetails'),'productable' ); 
    },

    favourites: function(){
        return this.morphMany( Model('Product/Favourites'),'favouriteable' );
    },

    wishlists: function(){
        return this.morphMany( Model('Product/Wishlists'),'wishlistable' );
    },

    wallet_transactions: function(){
        return this.morphMany( Model('Wallets/WalletTransactions'),'transactionable' );
    },

    reviews: function(){
        return this.morphMany( Model('Review/Reviews'),'reviewable' );
    },

    offers: function(){
        return this.morphOne(Model('ProductOffer'),'offerable')
    },

    comments: function(){
        return this.morphMany(Model('Comments'),'commentable')
    }, 
    pricable: function(){
        return this.morphMany( Model('ProductPrice'),'pricable' );
    }
    
}); 
   