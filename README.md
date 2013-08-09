LRSitemap
=========

A CouchApp that will generate a sitemap.xml and Schema.org marked up metadata for select resources located on the node


Installation
------------

1. Install [Kanso](http://kan.so)

1. Clone this repo

1. Install project dependencies
    
    ```sh
    cd /where/you/cloned/LRSitemap/sitemap
    kanso install
    ```

1. Push to your local LR Node CouchDB

    ```sh
    kanso push http://localhost:5984/resource_data
    ```

1. Add a Virtual Host mapping in CouchDB. I am going to use `http://sitemap:5984` for the virtual host in this example:
    
    ```sh
    curl -XPUT -H"Content-Type: application/json" -u admin "http://localhost:5984/_config/vhosts/sitemap:5948" --data '"/resource_data/_design/sitemap/_rewrite"'
    ```

1. In my `/etc/hosts` add a mapping for `http://sitemap`.

    ```sh
    127.0.0.1 localhost sitemap
    ```

1. Ping sitemap to ensure it works.

    ```sh
    ping sitemap
    ```
    
1. Load http://sitemap:5984 in your favorite browser... you should see the site index displayed.  The individual <loc> entries should point to a sitemap for each domain of resources.  The <loc> in each sitemap should return a page that renders a basic html data page containing embedded Schema.org microdata/metadata.

