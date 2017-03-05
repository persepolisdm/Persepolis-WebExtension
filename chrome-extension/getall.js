var BrowserNameSpace = chrome;

function sendToExtension(msg) {
    BrowserNameSpace.runtime.sendMessage({
        type:"getSelected",
        message: msg
    });
}

var links = [];

//Get links of anchor tags
var anchor_elements = document.querySelectorAll("a");
for(var i=0; i<anchor_elements.length; i++) {
    links.push(anchor_elements[i].href);
}


//Send html selection back to extension
sendToExtension(links);