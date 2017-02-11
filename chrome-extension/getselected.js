function sendToExtension(msg) {
    chrome.runtime.sendMessage({
        type:"getSelected",
        message: msg
    });
}


var selectedNode = window.getSelection().getRangeAt(0).commonAncestorContainer;
var nodes = selectedNode.querySelectorAll("a");
var links = [];
for(var i=0;i<nodes.length;i++){
    links.push(nodes[i].href);
}

//Send html selection back to extension
sendToExtension(links);