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


//Broswer identifying
let BrowserNameSpace;
let isChrome=false,isFF=false;


const DEBUG = false;



//let letItGo = []; //Let it go, let it gooo Can't hold it back anymore



function UrlMessage() {
    this.url= '';
    this.cookies= '';
    this.useragent= '';
    this.filename= '';
    this.filesize= '';
    this.referrer= '';
    this.postdata= '';
}


if(typeof browser !== 'undefined' ){
    BrowserNameSpace = browser ;
    isFF=true;
}
else if(typeof chrome !== 'undefined' ){
    BrowserNameSpace = chrome;
    isChrome=true;
}


function L(msg) {
    if(DEBUG)
        console.log(msg);
}


let interruptDownloads = true;
let PDMNotFound = false;
let interruptDownload = false;
let hostName = 'com.persepolis.pdmchromewrapper';
let keywords = [];


SendInitMessage();



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



function getDomain(url){

    var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join()

    url = url.replace(/.*?:\/\//g, "");
    url = url.replace(/www./g, "");
    var parts = url.split('/');
    url = parts[0];
    var parts = url.split('.');
    if (parts[0] === 'www' && parts[1] !== 'com'){
        parts.shift()
    }
    var ln = parts.length
        , i = ln
        , minLength = parts[parts.length-1].length
        , part

    // iterate backwards
    while(part = parts[--i]){
        // stop when we find a non-TLD part
        if (i === 0                    // 'asia.com' (last remaining must be the SLD)
            || i < ln-2                // TLDs only span 2 levels
            || part.length < minLength // 'www.cn.com' (valid TLD as second-level domain)
            || TLDs.indexOf(part) < 0  // officialy not a TLD
        ){
            var actual_domain = part;
            break;
            //return part
        }
    }
    //console.log(actual_domain);
    var tid ;
    if(typeof parts[ln-1] != 'undefined' && TLDs.indexOf(parts[ln-1]) >= 0)
    {
        tid = '.'+parts[ln-1];
    }
    if(typeof parts[ln-2] != 'undefined' && TLDs.indexOf(parts[ln-2]) >= 0)
    {
        tid = '.'+parts[ln-2]+tid;
    }
    if(typeof tid != 'undefined')
        actual_domain = actual_domain+tid;
    else
        actual_domain = actual_domain+'.com';


    return actual_domain;
}


function getCookies(url,callback) {
    let domain = getDomain(url);
    let Query = {domain:domain};

    if(isChrome){
        BrowserNameSpace.cookies.getAll(Query,(cookies)=>{
            let cookieArray = [];
            for(let cookie of cookies){
                cookieArray.push(cookie.name + "=" + cookie.value);
            }
            callback(cookieArray.join(";"));
        });
    }else if(isFF){
        BrowserNameSpace.cookies.getAll(Query).then((cookies)=>{
            let cookieArray = [];
            for(let cookie of cookies){
                cookieArray.push(cookie.name + "=" + cookie.value);
            }
            callback(cookieArray.join(";"));
        });
    }
}


function setCookies(message,callback) {
    message.useragent = navigator.userAgent;
    getCookies(message.url,urlCookie=>{
        message.cookies = urlCookie+";";
        L(message.cookies);
        if(message.referrer != null && message.referrer !="")
            getCookies(message.referrer,refererCookies=>{
                message.cookies += refererCookies+";";
                L(message.cookies);
                callback(message);
            });
        else
            callback(message);
    });
}

//chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
BrowserNameSpace.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let type = request.type;
    if(type === "getSelected" || type === "getAll"){

        let links = request.message;
        let usedLinks = [];
        L("enterted " + type);
        for(let link of links){
            //Check if we already didnt send this link
            if(link !="" && usedLinks.indexOf(link) == -1){
                usedLinks.push(link); //Add link to used link so we won't use it again
                let msg = new UrlMessage();
                msg.url = link;
                msg.referrer = sender.url;
                L("Sending...");
                SendURLMessage(msg);
            }
        }
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


//Send URL to the pdm-chrome-wrapper
function SendURLMessage(message) {

    setCookies(message, (cookie_with_message) => {
        L("Cookies set...");
        SendCustomMessage(cookie_with_message);
    });
}


function SendInitMessage(){
    SendCustomMessage({ version: "1.3" });
}

//Crafter for sending message to PDM
function SendCustomMessage(data,callback){
    L(data);
    BrowserNameSpace.runtime.sendNativeMessage(hostName, data,(response) =>{
        L(response);
        callback && callback(response); //Call the callback with response if it's available
    });
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
        L(info['linkUrl']);
        let msg = new UrlMessage();
        msg.url = info['linkUrl'];
        msg.referrer = info['pageUrl'];
        SendURLMessage(msg);
    }else if(info.menuItemId ==="download_links_with_pdm"){
        BrowserNameSpace.tabs.executeScript(null, { file: "/scripts/getselected.js" });
    }else if(info.menuItemId ==="download_all_links_with_pdm"){
        BrowserNameSpace.tabs.executeScript(null, { file: "/scripts/getall.js" });
    }
});



if(isChrome){
    //Finding files types in chrome is not like firefox
    //Cause firefox first find file type then start download but chrome has another event
    BrowserNameSpace.downloads.onDeterminingFilename.addListener( (downloadItem,suggest)=>{

        if (PDMNotFound || !interruptDownloads) { // pdm-chrome-wrapper not reachable
            suggest();
            return;
        }

        let url = downloadItem['finalUrl'] || downloadItem['url'] ;
        let fileName = downloadItem['filename'];
        let extension = fileName.split(".").pop();

        if(!url || isBlackListed(url) || (fileName !="" && isBlackListed(extension))){
            suggest();
        }else{
            BrowserNameSpace.downloads.cancel(downloadItem.id); // Cancel the download
            BrowserNameSpace.downloads.erase({ id: downloadItem.id }); // Erase the download from list
            let msg = new UrlMessage();
            msg.url = url;
            msg.referrer = downloadItem['referrer'];
            SendURLMessage(msg);
        }
    });
}



// Interrupt downloads
BrowserNameSpace.downloads.onCreated.addListener(function(downloadItem) {

    if (PDMNotFound || !interruptDownloads) { // pdm-chrome-wrapper not reachable
        return;
    }


    /*
     let fileSize = downloadItem['fileSize'];
     if (fileSize == -1 && fileSize < 300000) {
     return;
     }
     */

    let url = downloadItem['finalUrl'] || downloadItem['url'] ;

    if (!url) {
        return;
    }

    if(isBlackListed(url)){
        return;
    }
    if(isFF){

        let url = downloadItem['finalUrl'] || downloadItem['url'] ;
        let fileName = downloadItem['filename'];
        let extension = fileName.split(".").pop();

        if(isBlackListed(url) || (fileName !="" && isBlackListed(extension))){
            return;
        }

        BrowserNameSpace.downloads.cancel(downloadItem.id); // Cancel the download
        BrowserNameSpace.downloads.erase({ id: downloadItem.id }); // Erase the download from list
        let msg = new UrlMessage();
        msg.url = url;
        msg.referrer = downloadItem['referrer'];
        SendURLMessage(msg);

    }
});

function updateKeywords(data) {
    keywords = data.toLowerCase().split(/[\s,]+/);
    for(let i=0;i<keywords.length;i++){
        let tmp = keywords[i].trim();
        if(tmp ==""){
            keywords.splice(i,1);
            i--;
        }
    }
}

function isBlackListed(url) {
    /*if (url.includes("//docs.google.com/") || url.includes("googleusercontent.com/docs")) { // Cannot download from Google Docs
     return true;
     }*/
    for (keyword of keywords) {
        if (url != "" && url.includes(keyword)) {
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
