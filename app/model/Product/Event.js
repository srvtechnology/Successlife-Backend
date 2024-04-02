
const bookshelf= Config('database');

module.exports = bookshelf.model('Event',{

    hasTimestamps : true,

    tableName : 'product_events',
    hidden : ['attendeeInformation'],
    virtuals: {       
        is_event_sent : function(){
            let attendeeInformation = this.related('attendeeInformation');           
            if(attendeeInformation){  
                                   ;
                return (attendeeInformation.toJSON().length > 1) ? true : false;
            }
        }
    }, 
    country : function(){
        return this.belongsTo( Model('Location/Country'),'country_id');
    },

    city : function(){
        return this.belongsTo( Model('Location/City'),'city_id');
    },

    state : function(){
        return this.belongsTo( Model('Location/State'),'state_id');
    },
    order : function(){
        return this.belongsTo( Model('Order/Orders'),'order_id');
    },
    product:function(){
        return this.belongsTo( Model('Product/Product'),'product_id');
    },
    attendeeInformation: function(){
        return this.hasMany( Model('AttendeeInformation'),'event_id');
    }
}); 