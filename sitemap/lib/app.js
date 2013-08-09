


exports.views = {
    resource: {
        map: function(doc) {
            var util = require('views/lib/util');
            if (util.isLRMI(doc)) {
                if (!util.isArray(doc.resource_locator)) {
                    emit([encodeURIComponent(doc.resource_locator)], null);
                } else {
                    for(var i=0; i<doc.resource_locator.length; i++) {
                        emit([encodeURIComponent(doc.resource_locator[i])], null);
                    }
                }
            }
        }
    },
    location: {
        map: function(doc) {
            var util = require('views/lib/util');
            var url = require('views/lib/url');
            if (!util.isLRMI(doc))
                return;
            function siteindex(locator, timestamp) {
                url_obj = url.parse(locator);
                log([url_obj.hostname, locator, util.ts_to_integer(timestamp)]);
                emit([url_obj.hostname, locator], util.ts_to_integer(timestamp));
            }

            if (!util.isArray(doc.resource_locator)) {
                siteindex(doc.resource_locator, doc.node_timestamp)
            } else {
                for(var i=0; i<doc.resource_locator.length; i++) {
                    siteindex(doc.resource_locator[i], doc.node_timestamp)
                }
            }
        },

        reduce: function(keys, values, rereduce) {
            var maxOfArray = function (arr) {
                var max = 0;
                var QUANTUM = 32768;

                for (var i = 0, len = arr.length; i < len; i += QUANTUM) {
                    var submax = Math.max.apply(null, arr.slice(i, Math.max(i + QUANTUM, len)));
                    max = Math.max(submax, max);
                }

              return max;
            }

            return maxOfArray(values);
        }
    }

}

exports.lists = {
    index: function(head, request) {
        var util = require("views/lib/util");
        provides('xml', function(){
            start( { headers: {'Content-Type': 'application/xml'} } );
            send("".concat(
                    '<?xml version="1.0" encoding="utf-8"?>\n', 
                    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'));
            try {
                while(row = getRow()) {
                    var path = encodeURI(''.concat('http://', request.headers.Host, '/urlset/', row.key[0]));
                    log(row);
                    send(''.concat(
                        '   <sitemap>\n', 
                        '       <loc>',path.encodeHTML(),'</loc>\n',
                        '       <lastmod>', new Date(row.value).toISOString(),'</lastmod>\n',
                        '   </sitemap>\n'));
                }
            } catch (Error) {
                log(Error);
            } finally {
                send('</sitemapindex>');
            }

        });
    },
    urlset: function (head, request) {
        var util = require("views/lib/util");
        provides('xml', function(){
            start( { headers: {'Content-Type': 'application/xml'} } );
            send("".concat(
                    '<?xml version="1.0" encoding="utf-8"?>\n', 
                    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'));
            try {

                while(row = getRow()) {
                    var path = encodeURI(''.concat('http://', request.headers.Host, '/microdata/'+encodeURIComponent(row.key[1])));
                    send(''.concat(
                        '<url>', 
                            '<loc>',path.encodeHTML(),'</loc>',
                            '<lastmod>', new Date(row.value).toISOString(),'</lastmod>',
                        '</url>'));
                }
            } catch (Error) {
                log(Error);
            } finally {
                send('</urlset>');
            }

        });
    },
    microdata: function (head, request) {
        var util = require("views/lib/util");
        provides('html', function(){
            log(request);
            start( { headers: {'Content-Type': 'text/html'} } );

            var range = "",
                from = "First",
                until = "Last";
            if (request.query) {
                if (request.query.startkey) {
                    if (util.isArray(request.query.startkey)) {
                        from = request.query.startkey[0];
                    }
                    else {
                        from = request.query.startkey;
                    }

                }

                if (request.query.endkey) {
                    if (util.isArray(request.query.endkey)) {
                        until = request.query.endkey[0];
                    }
                    else {
                        until = request.query.endkey;
                    }

                } 
            }

            send("".concat('<!DOCTYPE html>',
                '<html>',
                    '<head>',
                    '<title>Learning Resources - ', from.encodeHTML(), ' to ', until.encodeHTML(), '</title>', 
                    '</head>',
                    '<body>'));
            try {
                while(row = getRow()) {

                    try{
                        if (row.doc && row.doc.resource_data && row.doc.resource_data.items) {
                            var result = util.expandLRMIResource(row.doc);
                            if (result)
                                send(result);
                        }
                    } catch(Error) {
                        log('error:'+Error);
                    }
                }
            } catch(Error) {
                log(Error);
            } finally {
                send('</body></html>')
            }

        });
    }
}

exports.rewrites = [
    {
        from: "microdata/:url",
        to:"_list/microdata/resource",
        query: {
            include_docs: "true",
            startkey:[':url'],
            endkey:[':url',{}]
        }
    },
    {
        from: "urlset/:host",
        to: "_list/urlset/location",
        query: {
            group_level: "2",
            startkey: [':host'],
            endkey: [':host',{}]
        }
    },
    {
        from: "",
        to: "_list/index/location",
        query: { group_level: "1"}

    }
];