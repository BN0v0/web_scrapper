# Goal
Use the standard Apify SDK to develop a simple web crawler that downloads all the product pages from a German supermarket called Edeka.
The key outcomes of should be:
*The crawler should run locally on your machine as a Node.js based CLI application
* The crawler should not use a browser (please base it on Apify's CheerioCrawler)
* The site to crawl is: https://www.edeka24.de
* The crawler should find and download every product page available on the site (here
is an example of one:
https://www.edeka24.de/Wein/Sekt-Prosecco/Deutschland/Kessler-Sekt-Hochgewae
chs-Chardonnay-Brut-0-75L.html)
* All product pages found by your crawler should be saved locally to disk in a
dedicated Apify KeyValueStore named "product-pages"
* Resources that are not product pages (e.g. the home page) can be downloaded but if
you do so, these should be stored in a separate Apify KeyValueStore
 
# Run the application
In order to run the application, please run the following command:
```shell
npm run start
```
 
# Thinking Process
 
1. Check if current page is:
    * in same domain as pretended
    * a valid URL (ignore tel and other types of URLs)
    * if extension is valid
    * if is a relative or absolute URL ( if relative add the domain before being analyzed)
2. Get the title (I am considering it a unique identifier),sanitize it, and the page content
3. Verify if it is a product page or a general page
4. Verify if already saved ( if not save )
5. Gather all links in page
6. Sanitize gathered links (check if the URL is valid and so on...)
7. Add to requestQueue ( to be later analyzed again)
 
 
## Identified problems
1. product page was identified as ending in .html (this can or not be the case - when analyzing the site, only found products with url ending in .html)
2. using title as identifier might not be the most accurate method
 
## What I would do to improve
 
1. Add only not already existing urls to requestQueue
2. Add command argument to only add and crawl product pages( this should be based on a url identifier)
3. Improve the page identification system -> title may not be the best identifier
4. Improve logging system and add a final summary to profile the system
