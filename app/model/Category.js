const bookshelf= Config('database');

module.exports = bookshelf.model('Category',{

    hasTimestamps : true,

    tableName : 'categories',

    virtuals: {
        parent_name: function() {
            return this.related('parent').get('name')
        },
    },

    parent : function(){
        return this.belongsTo(Model('Category'),'parent_id');
    },
    
    children : function(){
        return this.hasMany(Model('Category'),'parent_id');
    },

    products : function(){
        return this.belongsToMany(Model('Product/Product'),'category_product');
    },
    products : function(){
        return this.belongsToMany(Model('CategoryProductSpeaker'),'category_product_speakers');
    },
});