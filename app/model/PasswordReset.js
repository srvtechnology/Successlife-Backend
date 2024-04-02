const bookshelf= Config('database');

module.exports = bookshelf.model('PasswordReset',{

    tableName : 'password_resets',
});