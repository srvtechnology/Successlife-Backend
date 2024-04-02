const bookshelf= Config('database');

module.exports = bookshelf.model('ProductAutoCompleteSearch',{

    hasTimestamps : true,

    tableName : 'vw_product_autocomplete_search',
}); 