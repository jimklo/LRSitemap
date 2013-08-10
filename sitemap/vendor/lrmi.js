var util = require("views/lib/util");

var expandLRMIProps = function (propset) {
  function getPropValues(propval, itemprop) {
      var head = ''.concat('<span class="property name">', itemprop, ':&nbsp;</span>');
      var html_frag = '';
      if (util.isObject(propval)) {
        var propobjval = expandLRMIObject(propval, itemprop);
        if (propobjval.trim() !== "")
          html_frag = html_frag.concat('<div class="property object">', head, propobjval, '</div>');
      } else if (propval.trim() !== ""){
        html_frag = html_frag.concat('<div class="property">', head, '<span itemprop="', itemprop, '">', util.encodeHTML(propval), '</span></div>');
      }
      return html_frag;
  }

  var html = '';
  for(var itemprop in propset) {
    var untyped_property_value = propset[itemprop];
    if (util.isArray(untyped_property_value)) {
        for (var i=0; i<untyped_property_value.length; i++) {
            var propval = untyped_property_value[i];
            html = html.concat(getPropValues(propval,itemprop));
        }
    } else {
        html = html.concat(getPropValues(untyped_property_value, itemprop));
    }
  }
  return html
}

var expandLRMIObject = function(clazz, itemprop) {
  var html = '',
    prop = '';
  if (clazz.type && clazz.properties) {
    var type = null;
    if (util.isArray(clazz))
      type = clazz.type[0];
    else
      type = clazz.type;

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