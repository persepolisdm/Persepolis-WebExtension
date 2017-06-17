{
    if(typeof BrowserNameSpace === "undefined"){
        BrowserNameSpace;
        if(typeof browser !== 'undefined' )
            BrowserNameSpace = browser ;
        else if(typeof chrome !== 'undefined' )
            BrowserNameSpace = chrome;
    }

    function sendToExtension(msg) {
        BrowserNameSpace.runtime.sendMessage({
            type:"getSelected",
            message: msg
        });
    }

    let selectedNode = window.getSelection().getRangeAt(0).cloneContents();
    let nodes = selectedNode.querySelectorAll("a");
    let links = [];
    for(let i=0;i<nodes.length;i++){
        links.push(nodes[i].href);
    }

    //Send html selection back to extension
    sendToExtension(links);
}