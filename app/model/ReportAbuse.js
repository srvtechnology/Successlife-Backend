const bookshelf= Config('database');

module.exports = bookshelf.model('ReportAbuse',{

    hasTimestamps : false,

    tableName : 'report_abuses',
});