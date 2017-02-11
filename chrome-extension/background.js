/*
* pdm-chrome-wrapper (forked from uget-chrome-wrapper ) is an extension to integrate uGet Download manager
* with Google Chrome, Chromium and Vivaldi in Linux and Windows.
*
* Copyright (C) 2016  Gobinath
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var interruptDownloads = true;
var ugetWrapperNotFound = false;
var interruptDownload = false;
var disposition = '';
var hostName = 'com.persepolis.pdmchromewrapper';
var chromeVersion;
var filter = [];
var keywords = [];
var requestList = [{
    cookies: '',
    postdata: '',
    id: ''
}, {
    cookies: '',
    postdata: '',
    id: ''
}, {
    cookies: '',
    postdata: '',
    id: ''
}];
var currRequest = 0;
try {
    chromeVersion = /Chrome\/([0-9]+)/.exec(navigator.userAgent)[1];
} catch (ex) {
    chromeVersion = 33;
}
chromeVersion = parseInt(chromeVersion);
sendMessageToHost({ version: "1.1.6" });

if (localStorage["pdm-keywords"]) {
    keywords = localStorage["pdm-keywords"].split(/[\s,]+/);
} else {
	localStorage["pdm-keywords"] = '';
}


if (!localStorage["pdm-interrupt"]) {
    localStorage["pdm-interrupt"] = 'true';
} else {
    var interrupt = (localStorage["pdm-interrupt"] == "true");
    setInterruptDownload(interrupt);
}
//console.log(localStorage["pdm-interrupt"]);
// Message format to send the download information to the pdm-chrome-wrapper
var message = {
    url: '',
    cookies: '',
    useragent: '',
    filename: '',
    filesize: '',
    referrer: '',
    postdata: ''
};



function getCookies(url,callback) {
    chrome.cookies.getAll({url:url},function (cookies) {
        var cookieArray = [];
        for(var i=0;i<cookies.length;i++){
            cookieArray.push(cookies[i].name + "=" + cookies[i].value);
        }
        callback(cookieArray.join(";"));
    });
}







//chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var type = request.type;
    if(type === "getSelected" || type === "getAll"){

        var links = request.message;
        getCookies(sender.url,function (cookies){
            var usedLinks =[];
            for(var i=0;i<links.length;i++){
                var link = links[i];
                //Check if we already didnt send this link
                if(usedLinks.indexOf(link) == -1){
                    clearMessage();
                    usedLinks.push(link); //Add link to used link so we won't use it again
                    message.url = link;
                    message.referrer = sender.url;
                    message.cookies  = cookies;
                    sendMessageToHost(message);

                }
            }
            clearMessage();
        });
    }
    else if(type == "keyPress"){
        var msg = request.message;
        if(msg === 'enable') {
            // Temporarily enable
            setInterruptDownload(true);
        } else if(msg == 'disable') {
            // Temporarily disable
            setInterruptDownload(false);
        } else {
            // Toggle
            setInterruptDownload(!interruptDownloads, true);
        }
    }
});

// Send message to the pdm-chrome-wrapper
function sendMessageToHost(message) {
    chrome.runtime.sendNativeMessage(hostName, message, function(response) {
        ugetWrapperNotFound = (response == null);
        //console.log(response);
    });
}

function clearMessage() {
    message.url = '';
    message.cookies = '';
    message.filename = '';
    message.filesize = '';
    message.referrer = '';
    message.useragent = '';
}

function postParams(source) {
    var array = [];
    for (var key in source) {
        array.push(encodeURIComponent(key) + '=' + encodeURIComponent(source[key]));
    }
    return array.join('&');
}

//Add download with persepolis to context menu
chrome.contextMenus.create({
    title: 'Download with Persepolis',
    id: "download_with_pdm",
    contexts: ['link']
});

//Add download selected text to context menu
chrome.contextMenus.create({
    title: 'Download Selected links with Persepolis',
    id: "download_links_with_pdm",
    contexts: ['selection']
});

//Add download ALL LINKS to context menu
chrome.contextMenus.create({
    title: 'Download All Links with Persepolis',
    id: "download_all_links_with_pdm",
    contexts: ['page']
});




chrome.contextMenus.onClicked.addListener(function(info, tab) {
    "use strict";
    if (info.menuItemId === "download_with_pdm") {
        clearMessage();
        message.url = info['linkUrl'];
        message.referrer = info['pageUrl'];
	    message.cookies  = info['cookies'];
        sendMessageToHost(message);
        clearMessage();
    }else if(info.menuItemId ==="download_links_with_pdm"){
        chrome.tabs.executeScript(null, { file: "getselected.js" });
    }else if(info.menuItemId ==="download_all_links_with_pdm"){
        chrome.tabs.executeScript(null, { file: "getall.js" });
    }
});



// Interrupt Google Chrome download
chrome.downloads.onCreated.addListener(function(downloadItem) {

    if (ugetWrapperNotFound || !interruptDownloads) { // pdm-chrome-wrapper not installed
        return;
    }

    var fileSize = downloadItem['fileSize'];

    if (fileSize != -1 /*&& fileSize < 300000*/) {
        return;
    }

    var url = '';
    if (chromeVersion >= 54) {
        url = downloadItem['finalUrl'];
    } else {
        url = downloadItem['url'];
    }

    if (!url) {
        return;
    }

    if (isBlackListed(url)) {
        return;
    }

    chrome.downloads.cancel(downloadItem.id); // Cancel the download
    chrome.downloads.erase({ id: downloadItem.id }); // Erase the download from list

    clearMessage();
    message.url = url;
    message.filename = downloadItem['filename'];
    message.filesize = fileSize;
    message.referrer = downloadItem['referrer'];
    sendMessageToHost(message);
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (details.method == 'POST') {
        message.postdata = postParams(details.requestBody.formData);
    }
    return {
        requestHeaders: details.requestHeaders
    };
}, {
    urls: [
        '<all_urls>'
    ],
    types: [
        'main_frame',
        'sub_frame'
    ]
}, [
    'blocking',
    'requestBody'
]);
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    clearMessage();
    currRequest++;
    if (currRequest > 2)
        currRequest = 2;
    requestList[currRequest].id = details.requestId;
    for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name.toLowerCase() === 'user-agent') {
            message.useragent = details.requestHeaders[i].value;
        } else if (details.requestHeaders[i].name.toLowerCase() === 'referer') {
            requestList[currRequest].referrer = details.requestHeaders[i].value;
        } else if (details.requestHeaders[i].name.toLowerCase() === 'cookie') {
            requestList[currRequest].cookies = details.requestHeaders[i].value;
        }
    }
    return {
        requestHeaders: details.requestHeaders
    };
}, {
    urls: [
        '<all_urls>'
    ],
    types: [
        'main_frame',
        'sub_frame',
        'xmlhttprequest'
    ]
}, [
    'blocking',
    'requestHeaders'
]);
chrome.webRequest.onHeadersReceived.addListener(function(details) {

    if (ugetWrapperNotFound) { // pdm-chrome-wrapper not installed
        return {
            responseHeaders: details.responseHeaders
        };
    }

    if (!details.statusLine.includes("200")) { // HTTP response is not OK
        return {
            responseHeaders: details.responseHeaders
        };
    }

    if (isBlackListed(details.url)) {
        return {
            responseHeaders: details.responseHeaders
        };
    }

    interruptDownload = false;
    message.url = details.url;
    var contentType = "";

    for (var i = 0; i < details.responseHeaders.length; ++i) {
        if (details.responseHeaders[i].name.toLowerCase() == 'content-length') {
            message.filesize = details.responseHeaders[i].value;
            var fileSize = parseInt(message.filesize);
            /*if (fileSize < 300000) { // 300 kb
                return {
                    responseHeaders: details.responseHeaders
                };
            }*/
        } else if (details.responseHeaders[i].name.toLowerCase() == 'content-disposition') {
            disposition = details.responseHeaders[i].value;
            if (disposition.lastIndexOf('filename') != -1) {
                message.filename = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1];
                message.filename = message.filename.replace(/["']/g, "");
                interruptDownload = true;
            }
        } else if (details.responseHeaders[i].name.toLowerCase() == 'content-type') {
            contentType = details.responseHeaders[i].value;
            if (/\b(?:xml|rss|javascript|json|html|text)\b/.test(contentType)) {
                interruptDownload = false;
                return {
                    responseHeaders: details.responseHeaders
                };
            } else if (/\b(?:application\/|video\/|audio\/)\b/.test(contentType) == true) {
                interruptDownload = true;
            } else {
                return {
                    responseHeaders: details.responseHeaders
                };
            }
        }
    }
    if (interruptDownload == true && interruptDownloads == true) {
        for (var i = 0; i < filter.length; i++) {
            if (filter[i] != "" && contentType.lastIndexOf(filter[i]) != -1) {
                return {
                    responseHeaders: details.responseHeaders
                };
            }
        }
        for (var j = 0; j < 3; j++) {
            if (details.requestId == requestList[j].id && requestList[j].id != "") {
                message.referrer = requestList[j].referrer;
                message.cookies = requestList[j].cookies;
                break;
            }
        }
        if (details.method != "POST") {
            message.postdata = '';
        }
        sendMessageToHost(message);
        message.postdata = '';
        if (chromeVersion >= 35) {
            return { redirectUrl: "javascript:" };
        } else if (details.frameId === 0) {
            chrome.tabs.update(details.tabId, {
                url: "javascript:"
            });
            var responseHeaders = details.responseHeaders.filter(function(header) {
                var name = header.name.toLowerCase();
                return name !== 'content-type' &&
                    name !== 'x-content-type-options' &&
                    name !== 'content-disposition';
            }).concat([{
                name: 'Content-Type',
                value: 'text/plain'
            }, {
                name: 'X-Content-Type-Options',
                value: 'nosniff'
            }]);
            return {
                responseHeaders: responseHeaders
            };
        }
        return {
            cancel: true
        };
    }
    clearMessage();
    return {
        responseHeaders: details.responseHeaders
    };
}, {
    urls: [
        '<all_urls>'
    ],
    types: [
        'main_frame',
        'sub_frame'
    ]
}, [
    'responseHeaders',
    'blocking'
]);

function updateKeywords(data) {
    keywords = data.split(/[\s,]+/);
}

function isBlackListed(url) {
    /*if (url.includes("//docs.google.com/") || url.includes("googleusercontent.com/docs")) { // Cannot download from Google Docs
        return true;
    }*/
    for (keyword of keywords) {
        if (url.includes(keyword)) {
            return true;
        }
    }
    return false;
}


function setInterruptDownload(interrupt, writeToStorage) {
    interruptDownloads = interrupt;
    if (interrupt) {
        chrome.browserAction.setIcon({ path: "./icon_32.png" });
    } else {
        chrome.browserAction.setIcon({ path: "./icon_disabled_32.png" });
    }
    if(writeToStorage) {
        localStorage["pdm-interrupt"] = interrupt.toString();
    }
}
