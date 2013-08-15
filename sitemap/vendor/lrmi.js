var util = require("views/lib/util");

var errors = [];

var setError = function(msg, itemprop, propval) {
  errors.push(''.concat('<div class="error"><div class="title">', msg, '</div>',
    '<div class="propname">', itemprop, '</div><pre><code>', 
    util.encodeHTML(JSON.stringify(propval, null, '    ')),'</code></pre></div>'));
}

var sendErrors = function() {
  for (var i=0; i<errors.length; i++)
    send(errors[i]);
  errors=[];
}

exports.sendErrors = sendErrors;

var expandLRMIProps = function (propset) {
  function getPropValues(propval, itemprop) {
      var head = ''.concat('<span class="property name">', itemprop, ':&nbsp;</span>');
      var html_frag = '';
      try {
      if (util.isObject(propval)) {
        var propobjval = expandLRMIObject(propval, itemprop);
        if (propobjval.trim() !== "")
          html_frag = html_frag.concat('<div class="property object">', head, propobjval, '</div>');
      } else if (util.isArray(propval)) {
        setError("Badly formatted value", itemprop, propval);
        for (var i=0; i<propval.length; i++) {
          html_frag = html_frag.concat(getPropValues(propval[i], itemprop));
        }
      } else if (propval.trim() !== ""){
        html_frag = html_frag.concat('<div class="property">', head, '<span itemprop="', itemprop, '">', util.encodeHTML(propval), '</span></div>');
      }
      } catch (Error) {
        setError(Error, itemprop, propval);
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
        '<div class="itemscope" ', prop, ' itemscope itemtype="', type, '">\n',
          '<div class="property type">Object Type: <span class="type">', type, '</span></div>\n',
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
        html = html.concat('<div class="error"><h3>Problem parsing envlope for LRMI</h3><pre><code>',
          error, '</code></pre></div>')
      }
      html = "".concat('<div class="lrmi_data"><h2>Schema.org/LRMI Microdata</h2>', html, '</div>');

      html = html.concat('<div class="resource_data"><h2>LR JSON Envelope</h2><pre><code>',
        util.encodeHTML(JSON.stringify(doc, null, "    ")),
        '</code></pre></div>');
    }
  }
  return html;
}
exports.expandLRMIResource = expandLRMIResource;