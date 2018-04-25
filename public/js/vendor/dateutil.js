var dateFormat_ws = 'yyyyMMdd';
var dateFormat_us = 'yyyy-MM-dd';


Date.prototype.toUTC = function() {
    return Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds());
};

Date.prototype.toUSDate = function() {
    return this.toString(dateFormat_us);
};

Date.prototype.toWSDate = function() {
    return this.toString(dateFormat_ws);
};