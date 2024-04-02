
const bookshelf= Config('database');

module.exports = bookshelf.model('Testimonial',{

    hasTimestamps : true,

    tableName : 'testimonials',
});