const bookshelf   = Config('database');

module.exports = bookshelf.model('Profile', {
    
    hasTimestamps : true,

    tableName : 'profiles',

    virtuals: {
        full_name: function() {
            let firstName = this.get('first_name');
            let middleName = this.get('middle_name');  
             
            if(firstName != undefined){                                        
                return `${this.get('first_name')} ${this.get('last_name')}`;
            } else
            if( middleName != undefined){                              
                return `${this.get('first_name')} ${this.get('middle_name')} ${this.get('last_name')}`;
            }
            else{
                return null;
            }    
        },
    },

    user : function(){
        return this.belongsTo(Model('User'));
    },

    country : function(){
        return this.belongsTo(Model('Country'),'country_id');
    },    

    state: function(){ 
        return this.belongsTo(Model('State'),'state_id');
    },

    city: function(){ 
        return this.belongsTo(Model('City'),'city_id');
    },


});

