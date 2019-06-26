'use strict';
var moment = require('moment');

exports.parseFilter = function(filter) {
  var str = JSON.stringify(filter);
  var obj = JSON.parse(str, function(key, value) {
    if (typeof value === 'string' && (moment(value, 'YYYY-MM-DD', true).isValid() || moment(value, 'YYYY-MM-DD HH:mm:ss', true).isValid())) {
      return moment(value).toDate();
    }

    return value;
  });
  return obj;
};
