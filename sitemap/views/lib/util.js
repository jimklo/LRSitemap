if (!String.prototype.encodeHTML) {
  String.prototype.encodeHTML = function() {
    return this.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
}

if (typeof(exports) === "undefined") {
  exports = {};
}

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

var expandLRMIProps = function (propset) {
  var html = ''
  for(var itemprop in propset) {
    for (var i=0; i<propset[itemprop].length; i++) {
      var propval = propset[itemprop][i];
      var head = ''.concat('<span class="property name">', itemprop, ':&nbsp;</span>');
      if (isObject(propval)) {
        var propobjval = expandLRMIObject(propval, itemprop);
        if (propobjval.trim() !== "")
          html = html.concat('<div class="property object">', head, propobjval, '</div>');
      } else if (propval.trim() !== ""){
        html = html.concat('<div class="property">', head, '<span itemprop="', itemprop, '">', propval.encodeHTML(), '</span></div>');
      }
    }
  }
  return html
}

var expandLRMIObject = function(clazz, itemprop) {
  var html = '',
    prop = '';
  if (clazz.type && clazz.properties) {
    var type = clazz.type[0];
    if (itemprop) {
      prop = ' '.concat('itemprop="', itemprop, '"');
    }
    else {
      prop = ''
    }
    var propvalues = expandLRMIProps(clazz.properties);
    if (propvalues.trim() !== "")
      html = ''.concat(
        '<div', prop, ' itemscope itemtype="', type, '">\n', 
          propvalues,
        '</div>\n');
  }
  return html;
}

var expandLRMIResource = function(doc) {
  var html = ""
  if (doc.resource_data && doc.resource_data.items) {
    for (var i=0; i<doc.resource_data.items.length; i++) {
      try {
        html = html.concat(expandLRMIObject(doc.resource_data.items[i]), '\n');
      } catch (error) {
        log("problem will robinson: "+ error);

      }
    }
  }
  return html;
}
exports.expandLRMIResource = expandLRMIResource;

