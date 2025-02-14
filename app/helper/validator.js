const Validator   = require('node-input-validator');
const bookshelf   = Config('database');

Validator.messages({
    unique          : 'The :attribute has already been taken.',
    uniqueWithout   : 'The :attribute has already been taken.',
    inDatabase      : `The :attribute doesn't exist in our record.`,
    inDatabaseInput : `The :attribute doesn't exist in our record.`,
    minLength       : 'The :attribute can not be less than :arg0.',
    chkUrlFormate   : 'The :attribute url not acceptable.',
    fileType        : 'The :attribute file type is not acceptable.' ,
    timeFormate     : 'The :attribute time formate is not acceptable.',
    caseSensitive   : 'Only uppercase allowed in :attribute.',
    dateTimeFormate : 'Accept only YYYY-MM-DD H:i:s in :attribute.',
    isEmail         : 'The :attribute email not acceptable',

});

Validator.extend('unique',async function (coloum, value, args) {
    if(!args) return false;

    var table   = _.isArray(args) ?  args[0] : args;
    var coloum  = _.isArray(args) ?  args[1] : coloum;

    var is_unique = false;

    await bookshelf.knex(table).where(coloum,value).count(`${coloum} as count`).then((response)=>{
        is_unique = response[0].count == 0;
    }); 

    return is_unique;
});

Validator.extend('inDatabase',async function (coloum, value, args) {

    if(!args) return false;

    var table   = _.isArray(args) ?  args[0] : args;
    var coloum  = _.isArray(args) ?  args[1] : coloum;

    var in_database = false;

    await bookshelf.knex(table).where(coloum,value).count(`${coloum} as count`).then((response)=>{
        in_database = response[0].count > 0;
    }); 

    return in_database;
});

Validator.extend('inDatabaseInput',async function (coloum, value, args) {

    if(!args) return false;

    var table   = _.isArray(args) ?  args[0] : args;
    var coloum  = _.isArray(args) ?  args[1] : coloum;

    if(this.validator.inputs[table]){
        table = this.validator.inputs[table];
    }

    var in_database = false;

    await bookshelf.knex(table).where(coloum,value).count(`${coloum} as count`).then((response)=>{
        in_database = response[0].count > 0;
    }); 

    return in_database;
});

Validator.extend('uniqueWithout', async function (coloum, value, args) {

    let is_unique   = false;
    let table       = args[0];
    let fields      = args.filter(v => (v !== table));
    let get_attrib  = fields.filter(v => (this.validator.inputs[v] && this.validator.inputs[v] !== ''));

    if(get_attrib.length === fields.length){
        return true;
    }

    await bookshelf.knex(table).where(coloum,value).count(`${coloum} as count`).then((response)=>{
        is_unique = response[0].count == 0;
    }); 

    return is_unique;
 
});

Validator.extend('chkUrlFormate', async function (coloum, value, args) {
    const Url           = require("url");
    let application     = Config('application');  
    let result          = Url.parse(value);

    return (application.match_hostname.indexOf(result.hostname) > -1);   
});

Validator.extend('fileType', async function (coloum, value, args) {
    if(!value){
       return false;
    }

    let fileExtension = _.last(_.split(value,'.'));

    return _.contain(args,fileExtension);
});
Validator.extend('timeFormate',async function(coloum, value, args){
   
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value);    
    if (isValid) {
        return true;
    } else {
        return false;
    }        
})
Validator.extend('caseSensitive',async function(coloum, value, args){

    var string = value;
    var stringCheck = string.toUpperCase() == string;

    if(stringCheck === true) {
        return true;
    }
    else{
        return false;
    }
    
})
Validator.extend('dateTimeFormate',async function(coloum, value, args){
   
    if (!value.match(/^[0-2][0-9][0-9][0-9]\-[0-1][0-9]\-[0-3][0-9] [0-2][0-9]\:[0-6][0-9]\:[0-6][0-9]$/)) {
        return false;
    }
    else
    {
        return true;
    }
}) 
Validator.extend('isEmail',async function(coloum, value, args){
    
    if (!value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        return false;
    }
    else
    {
        return true;
    }
})

module.exports = Validator;

