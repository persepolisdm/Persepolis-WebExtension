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
        let l = nodes[i].href.trim();
        if (l !== "")
            links.push(l);
    }


//Send html selection back to extension
    sendToExtension(links);
}
