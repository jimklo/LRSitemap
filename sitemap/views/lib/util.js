

if (typeof(exports) === "undefined") {
  exports = {};
}

var encodeHTML = function(str) {
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
};
if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function(str) {
    return this.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
}
exports.encodeHTML = encodeHTML;

var isArray = function(obj) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
}
exports.isArray = isArray;

var isObject = function(obj) {
    return Object.prototype.toString.call( obj ) === '[object Object]';
}
exports.isObject = isObject;

exports.ts_to_integer = function (ts) {
    return Math.floor(Date.parse(ts));
}

exports.integer_to_iso_ts = function(milliseconds) {
    return new Date(milliseconds).toISOString();
}

exports.integer_to_utc_ts = function(milliseconds) {
    return new Date(milliseconds).toUTCString();
}

exports.minOfArray = function (arr) {
  var min = Infinity;
  var QUANTUM = 32768;

  for (var i = 0, len = arr.length; i < len; i += QUANTUM) {
    var submin = Math.min.apply(null, arr.slice(i, Math.min(i + QUANTUM, len)));
    min = Math.min(submin, min);
  }

  return min;
}

exports.maxOfArray = function (arr) {
  var max = 0;
  var QUANTUM = 32768;

  for (var i = 0, len = arr.length; i < len; i += QUANTUM) {
    var submax = Math.max.apply(null, arr.slice(i, Math.max(i + QUANTUM, len)));
    max = Math.max(submax, max);
  }

  return max;
}

exports.isLRMI = function (doc) {
  if (doc.resource_data && doc.resource_data.items && isArray(doc.resource_data.items))
    return true;
  return false;
}



