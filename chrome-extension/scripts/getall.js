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

    let links = [];

//Get links of anchor tags
    let anchor_elements = document.querySelectorAll("a");
    for(let i=0; i<anchor_elements.length; i++) {
        links.push(anchor_elements[i].href);
    }


//Send html selection back to extension
    sendToExtension(links);
}