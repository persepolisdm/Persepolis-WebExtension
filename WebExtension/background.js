/*
 * Pdm WebExtension (forked from uget-chrome-wrapper ) is an extension to integrate Persepolis Download manager
 * with Google Chrome, Chromium, Firefox and Vivaldi in Linux, Windows and OSX.
 *
 * Modified copyright (C) 2017  Jafar Akhondali
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


//Broswer identifying
let BrowserNameSpace;
let isChrome=false,isFF=false;

const DEBUG = false;
const VERSION = "1.7.1";

//let letItGo = []; //Let it go, let it gooo Can't hold it back anymore



function UrlMessage() {
    this.url= '';
    this.cookies= '';
    this.useragent= '';
    this.filename= '';
    this.referrer= '';
    this.postdata= '';
}

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
}

//if str was encoded, return it. otherwise return encoded str
function denCode(str){
    //return encodeURIComponent(decodeURIComponent(str));
    return decodeURIComponent(str) !== str ? str : encodeURI(str);
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


//SendInitMessage(); Remove init cause we are in deadline xD


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
    let domain = getDomain(url);// This function was one of the best functions i've ever seen, but now it's uselss. I'll not delete it because i love it... I want to spread it to world using persepolis ... RIP my friend
    //let domainQuery= {domain:domain};
    let urlQuery = {url:url};

    let blacklistDecode = [
        "mycdn.me"
    ];

    if(isChrome){
        BrowserNameSpace.cookies.getAll(urlQuery,(urlcookies)=>{
            let cookieArray = [];
            if (blacklistDecode.indexOf(domain)  == -1)
                cookieArray = urlcookies.map((cookie)=>denCode(cookie.name)+ "=" + denCode(cookie.value));
            else
                cookieArray = urlcookies.map((cookie)=>cookie.name+ "=" + cookie.value);
            callback(cookieArray);
        });
    }else if(isFF){
        BrowserNameSpace.cookies.getAll(urlQuery).then((urlcookies)=>{
            let cookieArray = [];
            if (blacklistDecode.indexOf(domain)  == -1)
                cookieArray = urlcookies.map((cookie)=>{return denCode(cookie.name)+ "=" + denCode(cookie.value);});
            else
                cookieArray = urlcookies.map((cookie)=>{return cookie.name+ "=" + cookie.value});
            L(cookieArray);
            callback(cookieArray);
        });
    }
}


function setCookies(message) {

    return new Promise(function(ok, fuck) {
        message.useragent = navigator.userAgent;
        try{
            getCookies(message.url, urlCookie=> {

                message.cookies = urlCookie;
                // if (false && message.referrer != null && message.referrer != "") {
                //I know it's always false, at first it looked good but not now. so i saved the code for future jobless source code viewers like you
                //     getCookies(message.referrer, refererCookies=> {
                //         //if(message.cookies != refererCookies)
                //         //message.cookies += "; "+refererCookies;//(message.cookies == refererCookies) ? "" : ("; "+refererCookies);
                //         message.cookies = arrayUnique(message.cookies.concat(refererCookies)).join("; ");
                //         L("final cookies With referer:");
                //         L(message.cookies);
                //         ok(message);
                //     });
                // } else {
                message.cookies = arrayUnique(message.cookies).join("; ");
                //L("final cookies Without referer:");
                //L(message.cookies);
                ok(message);
                //}
            });
        }catch (errors){
            fuck(errors); // :)
        }
    });



}

BrowserNameSpace.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let type = request.type;

    if(type === "getSelected" || type === "getAll"){

        let links = request.message;
        let usedLinks = [];
        L("enterted " + type);

        let promiseQueue = [];
        for(let link of links){
            //Check if we already didnt send this link
            if(link !="" && usedLinks.indexOf(link) == -1){
                usedLinks.push(link); //Add link to used link so we won't use it again
                let msg = new UrlMessage();
                msg.url = link;
                msg.referrer = sender.url;
                promiseQueue.push(setCookies(msg));
                //, (cookie_with_message) => {
                //     L("Cookies set...");
                //     S endCustomMessage(cookie_with_message);
                // });
            }
        }
        Promise.all(promiseQueue).then(allPromises=>{
            SendToPDM(allPromises);
        }, function(err) {
            L("Some error :) " + err)
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


//Send cookie and send data to SendToPDM function
function setCookieAndSendToPDM(message) {
    setCookies(message).then((cookie_with_message) => {
        L("Cookies set...");
        SendToPDM(cookie_with_message);
    });
}

/**
 *
 *
 */
function SendToPDM(data,callback){
    SendCustomMessage({
        url_links:data.constructor === Array ? data : [data],
        version:VERSION
    },callback)
}


function SendInitMessage(){
    SendCustomMessage({ version: VERSION});
}

//Crafter for sending message to PDM
function SendCustomMessage(data,callback){
    L(data);
    L("Sending data ....");
    BrowserNameSpace.runtime.sendNativeMessage(hostName, data,(response) =>{
        L(response);
        L("Data sent !");
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
        setCookieAndSendToPDM(msg);
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
            setCookieAndSendToPDM(msg);
        }
    });
}

// Interrupt downloads
BrowserNameSpace.downloads.onCreated.addListener(function(downloadItem) {

    if (PDMNotFound || !interruptDownloads) { // pdm-chrome-wrapper not reachable
        return;
    }

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
        setCookieAndSendToPDM(msg);

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
    if (url.startsWith("blob://"))
        return true;

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
