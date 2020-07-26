var CDNCache = {

    localCDNPath: 'http://localhost:8890/',

    defaultSettings: {
        domains: [
            'cdnjs.cloudflare.com',
            'cdn.jsdelivr.net',
            'maxcdn.bootstrapcdn.com',
            'cdn.datatables.net',
            'cdns.gigya.com'
        ]
    },

    settings: {},

    reachable: false,

    init: function() {
        CDNCache.setupReachableChecker();

        // ---- trap all requests ----
        chrome.webRequest.onBeforeRequest.addListener(
            CDNCache.get,
            { urls: ["*://*/*", "*://*/*"] },
            ["blocking"]
        );

        chrome.storage.sync.get(
            CDNCache.defaultSettings,
            function(newSettings){
                CDNCache.settings = newSettings;
                chrome.storage.sync.set(newSettings);
            }
        );

        chrome.storage.onChanged.addListener(function(changes, namespace) {
            for (var key in changes) {
                CDNCache.settings[key] = changes[key].newValue;
            }
        });
    },

    setupReachableChecker: function() {
        var xhrOnload = function() {
            CDNCache.reachable = (this.status >= 200 && this.status < 400);
            localStorage.setItem('reachable', CDNCache.reachable);
        };

        var xhrOnerror = function() {
            CDNCache.reachable = false;
            localStorage.setItem('reachable', CDNCache.reachable);
        };

        setInterval(function() {
            var request = new XMLHttpRequest();
            request.open('GET', CDNCache.localCDNPath + "is-alive", true);
            request.timeout = 500;
            request.onload = xhrOnload;
            request.onerror = xhrOnerror;
            request.send();
        }, 1000);
    },

    get: function(request) {
        if (!CDNCache.reachable) {
            return {
                cancel: false
            };
        }

        // anchor-based url parser
        var a = document.createElement('a');
        a.href = request.url;

        if (CDNCache.settings.domains.indexOf(a.hostname) === -1) {
            return {
                cancel: false
            };
        }

        var newUrl = CDNCache.localCDNPath;
        newUrl += encodeURIComponent(a.protocol + "//" + a.host);
        newUrl += a.pathname + a.search + a.hash;

        return {
            redirectUrl: newUrl
        };
    }

};

CDNCache.init();
