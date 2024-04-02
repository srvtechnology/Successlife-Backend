
const bookshelf= Config('database');

module.exports = bookshelf.model('AttendeeInformation',{

    hasTimestamps : true,

    tableName : 'attendee_informations',

    country : function(){
        return this.belongsTo(Model('Country'),'country_id');
    }, 
    event_details: function(){
        return this.belongsTo(Model('Product/Event'),'event_id');
    },
    payment_category: function(){
        return this.belongsTo(Model('PaymentCategory'),'payment_category_id')
    },
    attendee_details:function(){
        return this.hasMany(Model('AttendeeDetail'),'attendee_id')
    },
    user:function(){
        return this.belongsTo(Model('User'),'user_id')
    },
    events:function(){
        return this.belongsTo(Model('Product/Product'),'event_id')
    }
});