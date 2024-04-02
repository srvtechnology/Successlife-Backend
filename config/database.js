const knex = require('knex')({
    client: 'mysql',
    connection: {
        timezone : 'UTC',
        host     : process.env.DB_HOST,
        port     : process.env.DB_PORT,
        user     : process.env.DB_USERNAME,
        password : process.env.DB_PASSWORD,
        database : process.env.DB_DATABASE,
        charset  : 'utf8'
    },
    migrations: {
        tableName: 'migrations'
    }
});

const Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
Bookshelf.plugin('pagination');
Bookshelf.plugin('visibility');
Bookshelf.plugin('virtuals');
Bookshelf.plugin('processor');
Bookshelf.plugin(require('bookshelf-eloquent'));
Bookshelf.plugin(require('bookshelf-soft-delete'));
Bookshelf.plugin(Helper('bookshelf-extends'));



module.exports = Bookshelf;
