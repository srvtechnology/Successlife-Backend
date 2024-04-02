
const bookshelf= Config('database');

module.exports = bookshelf.model('ProviderAccount',{

    hasTimestamps : true,

    tableName : 'provider_accounts',

});