
const bookshelf= Config('database');

module.exports = bookshelf.model('AttendeeDetail',{

    hasTimestamps : true,

    tableName : 'attendee_details',

    country:function(){
        return this.belongsTo(Model('Country'),'country_id');
    }
});