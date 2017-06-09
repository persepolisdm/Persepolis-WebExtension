/*
 * Pdm WebExtension (forked from uget-chrome-wrapper ) is an extension to integrate Persepolis Download manager
 * with Google Chrome, Chromium, Firefox and Vivaldi in Linux, Windows and OSX.
 *
 * Copyright (C) 2016  Gobinath
 * Modified copyright (C) 2017  Jafar Akhondali
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

let BrowserNameSpace;
let isChrome=false,isFF=false;
if(typeof browser !== 'undefined' ){
    BrowserNameSpace = browser ;
    isFF=true;
}
else if(typeof chrome !== 'undefined' ){
    BrowserNameSpace = chrome;
    isChrome=true;
}



let interruptDownloads = true;
let ugetWrapperNotFound = false;
let interruptDownload = false;
let disposition = '';
let hostName = 'com.persepolis.pdmchromewrapper';
let chromeVersion;
let keywords = [];

sendMessageToHost({ version: "1.3" });

if (localStorage["pdm-keywords"]) {
    keywords = localStorage["pdm-keywords"].split(/[\s,]+/);
} else {
    localStorage["pdm-keywords"] = '';
}


if (!localStorage["pdm-interrupt"]) {
    localStorage["pdm-interrupt"] = 'true';
} else {
    let interrupt = (localStorage["pdm-interrupt"] == "true");
    setInterruptDownload(interrupt);
}


//console.log(localStorage["pdm-interrupt"]);
// Message format to send the download information to the pdm-chrome-wrapper
let message = {
    url: '',
    cookies: '',
    useragent: '',
    filename: '',
    filesize: '',
    referrer: '',
    postdata: ''
};



function getCookies(url,callback) {

    if(isChrome){
        BrowserNameSpace.cookies.getAll({url:url},function (cookies) {
            let cookieArray = [];
            for(let cookie of cookies){
                cookieArray.push(cookie.name + "=" + cookie.value);
            }
            callback(cookieArray.join(";"));
        });
    }else if(isFF){
        BrowserNameSpace.cookies.getAll({url:url}).then(function (cookies) {
            let cookieArray = [];
            for(let cookie of cookies){
                cookieArray.push(cookie.name + "=" + cookie.value);
            }
            callback(cookieArray.join(";"));
        });
    }


}



//chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
BrowserNameSpace.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let type = request.type;
    if(type === "getSelected" || type === "getAll"){

        let links = request.message;
        getCookies(sender.url,function (cookies){
            let usedLinks =[];
            for(let link of links){
                //Check if we already didnt send this link
                if(usedLinks.indexOf(link) == -1){
                    clearMessage();
                    usedLinks.push(link); //Add link to used link so we won't use it again
                    message.url = link;
                    message.referrer = sender.url;
                    message.cookies  = cookies;
                    console.log(cookies);
                    sendMessageToHost(message);
                }
            }
            clearMessage();
        });
    }
    else if(type == "keyPress"){
        let msg = request.message;
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
    BrowserNameSpace.runtime.sendNativeMessage(hostName, message, function(response) {
        ugetWrapperNotFound = (response == null);
        console.log(response);
    });
}

//Clear message :|
function clearMessage() {
    message.url = '';
    message.cookies = '';
    message.filename = '';
    message.filesize = '';
    message.referrer = '';
    message.useragent = '';
}

//Add download with persepolis to context menu
BrowserNameSpace.contextMenus.create({
    title: 'Download with Persepolis',
    id: "download_with_pdm",
    contexts: ['link']
});

//Add download selected text to context menu
BrowserNameSpace.contextMenus.create({
    title: 'Download Selected links with Persepolis',
    id: "download_links_with_pdm",
    contexts: ['selection']
});

//Add download ALL LINKS to context menu
BrowserNameSpace.contextMenus.create({
    title: 'Download All Links with Persepolis',
    id: "download_all_links_with_pdm",
    contexts: ['page']
});




BrowserNameSpace.contextMenus.onClicked.addListener(function(info, tab) {
    "use strict";
    if (info.menuItemId === "download_with_pdm") {
        let url = info['linkUrl'].substr(0,info['linkUrl'].indexOf("/",8)+1);
        console.log(info['linkUrl']);
        console.log(url);
        getCookies(url,function (cookies){
            console.log(cookies);
            clearMessage();
            message.url = info['linkUrl'];
            message.referrer = info['pageUrl'];
            message.cookies  = cookies;
            sendMessageToHost(message);
            clearMessage();
        });
    }else if(info.menuItemId ==="download_links_with_pdm"){
        BrowserNameSpace.tabs.executeScript(null, { file: "/scripts/getselected.js" });
    }else if(info.menuItemId ==="download_all_links_with_pdm"){
        BrowserNameSpace.tabs.executeScript(null, { file: "/scripts/getall.js" });
    }
});



// Interrupt downloads
BrowserNameSpace.downloads.onCreated.addListener(function(downloadItem) {

    if (ugetWrapperNotFound || !interruptDownloads) { // pdm-chrome-wrapper not reachable
        return;
    }

    let fileSize = downloadItem['fileSize'];

    if (fileSize != -1 /*&& fileSize < 300000*/) {
        return;
    }

    let url = url = downloadItem['finalUrl'];

    if (!url) {
        return;
    }

    if (isBlackListed(url)) {
        return;
    }

    BrowserNameSpace.downloads.cancel(downloadItem.id); // Cancel the download
    BrowserNameSpace.downloads.erase({ id: downloadItem.id }); // Erase the download from list
    getCookies(url,function(cookies){
        clearMessage();
        message.url = url;
        message.cookies = cookies;
        message.referrer = downloadItem['referrer'];
        sendMessageToHost(message);
    });

    //message.filename = downloadItem['filename']; Let Persepolis find download name
    //message.fileSize = downloadItem['fileSize']; Let Persepolis find download fileSize
    //message.filesize = fileSize;
});

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
        BrowserNameSpace.browserAction.setIcon({ path: "./icons/icon_32.png" });
    } else {
        BrowserNameSpace.browserAction.setIcon({ path: "./icons/icon_disabled_32.png" });
    }
    if(writeToStorage) {
        localStorage["pdm-interrupt"] = interrupt.toString();
    }
}
