Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

Date.prototype.subDays = function(days) {
    this.setDate(this.getDate() - parseInt(days));
    return this;
};

Date.prototype.toTime = function() {
    return this.getTime();
};

Date.prototype.format = function(format = 'yyyy-mm-dd'){

    var format  = (format === 'mysql') ? 'yyyy-mm-dd HH:MM:ss': format;

    var dateFormat = require('dateformat');
    return dateFormat(this,format);
}