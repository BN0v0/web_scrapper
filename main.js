const Apify = require("apify");
const origin = "https://www.edeka24.de";
const {
    utils: { log },
} = Apify;
var count = 0;
var requests = [];

Apify.main(async () => {
    const requestList = new Apify.RequestList({
        sources: [{ requestsFromUrl: origin }],
    });
    await requestList.initialize();
    const requestQueue = await Apify.openRequestQueue();

    //* Initialize datasets
    const product_store = await await Apify.openKeyValueStore("product-pages");
    const general_store = await Apify.openKeyValueStore("general-pages");
    
    const handlePageFunction = async ({
        request,
        response,
        body,
        contentType,
        $,
    }) => {
        count++;
        log.info("Nº " + count + " URL analyses")
        log.info("-> Analysing: " + request.url)
        //* Check if URL is absolute or not
        //* Check if is same domain as pretended
        //* Check if url extension is valid
        url = isValidURL(request.url)
        if (url != false && contentType.type == "text/html") {
            //* Prepare key to add to store ( using as unique key -> Title )
            var title = titleTreatment($("title").text())
            log.info("title: " + title);
            try {
                //* Check if it is product or general page and save accordingly
                if (isProduct(url)) {
                    log.info("Saved as product page:" + url);
                    product_store.setValue(title, body);
                } else {
                    log.info("Saved as general page:" + url);
                    general_store.setValue(title, body);
                }
            } catch (e) {
                log.error(e);
            } finally {
                //* Gather all page links
                var current_page_links = [];
                current_page_links = getPageURL($, current_page_links);
                //* Add to Queue
                current_page_links.forEach((link) => {
                    //* Filter all links for valid parameters
                    url = isValidURL(link);
                    if ( url != false && requests.find(element => element == url) == undefined){
                        requestQueue.addRequest({ url: url });
                        requests.push(url);
                    }
                });
            }
        }
    };

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        // The crawler downloads and processes the web pages in parallel, with a concurrency
        // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
        // Here we define some hard limits for the concurrency.
        minConcurrency: 10,
        maxConcurrency: 50,
        // The crawler downloads and processes the web pages in parallel, with a concurrency
        // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
        // Here we define some hard limits for the concurrency.
        minConcurrency: 10,
        maxConcurrency: 50,
        handlePageFunction,
    });

    log.info("Starting the crawl.");
    await crawler.run();
    log.info("Crawl finished.");
});

function isValidURL(url) {
    //* If URL verifies all parameters return true, otherwise return false
    //* @parameter: url -> String

    //* check if is absolute or relative url 
    url = isURLAbsolute(url);

    //* check domain 
    if(url.startsWith(origin) == false)
        return false;
    
    //* check extension 
    if(isValidExtension(url) == false)
        return false;

    //* check if is a valid url 
    try {
        var valid_url = new URL(url);
        return (valid_url.protocol == "https:" || valid_url.protocol == "http:") ? url : false;
    } catch (_) {
        return false;
    }

}

function getPageURL($, current_page_links) {
    $("a[href]").each((index, el) => {
        if (
            url.startsWith(origin) &&
            isValidURL($(el).attr("href")) &&
            !current_page_links.includes($(el).attr("href"))
        ) {
            current_page_links.push($(el).attr("href"));
        }
    });

    $("button[href]").each((index, el) => {
        if (
            url.startsWith(origin) &&
            isValidURL($(el).attr("href")) &
                !current_page_links.includes($(el).attr("href"))
        ) {
            current_page_links.push($(el).attr("href"));
        }
    });
    return current_page_links;
}

function isURLAbsolute(url) {
    //* if the provided url is relative it wont have the domain portion
    //* In order to be considered as an url concatenate the domain with relative url
    return url.charAt(0) === "/" ? origin + url : url;
}

function isValidExtension(url) {
    //* Remove all urls with extensions diferent of: .php , .html
    var ext = (/[.]/.exec(url)) ? /[^.]+$/.exec(url) : undefined;
    return (ext == "png" || ext == "jpg" || ext == "svg" || ext == "ico" || ext == "js" || ext == "css") ? false : true;
}

function isProduct(url) {
    //* if the url ends with .html is a product, otherwize is a normal page
    return url.includes(".html") ? true : false;
}

var translateString = (function() {
    var translate_re = /[öäüÖÄÜ]/g;
    var translate = {
      "ä": "a", "ö": "o", "ü": "u",
      "Ä": "A", "Ö": "O", "Ü": "U"   // probably more to come
    };
    return function(s) {
      return ( s.replace(translate_re, function(match) { 
        return translate[match]; 
      }) );
    }
  })();

function titleTreatment(title){
    if(title.trim() == "")
        return "Page" + count;
    // Replace all german char
    title = translateString(title);
    // Replace all chars not allowed and empty spaces
    return title.replace('/[^a-zA-Z0-9 ]/g','').replaceAll(/\s/g,'').replace(/[^\w ]/g, '');
}
