{
    if (typeof BrowserNameSpace === "undefined") {
        BrowserNameSpace;
        if (typeof browser !== 'undefined')
            BrowserNameSpace = browser;
        else if (typeof chrome !== 'undefined')
            BrowserNameSpace = chrome;
    }

    let links = [];
    let filteredLinks = [];
    const extensions = {}; // Create object of url extensions
    for (let i = 0; i < window.getSelection().rangeCount; i++) {
        const selectedNode = window.getSelection().getRangeAt(i).cloneContents();
        const nodes = selectedNode.querySelectorAll("a");
        for (let i = 0; i < nodes.length; i++) {
            let l = nodes[i].href.trim();
            if (l !== "" || l.startsWith("mailto")) {
                links.push(l);
                const extension = getExtensionOfUrl(l);
                if (extension)
                    extensions[extension] = true;
            }
        }
    }

    function filterLinks() {
        const conditionValue = conditionTypeSelectOption.options[conditionTypeSelectOption.selectedIndex].value;
        const includeExtension = includeSelectOption.options[includeSelectOption.selectedIndex].value;
        const includeText = includeTextDom.value.trim();
        let mustInclude = conditionValue === "include";
        let filtering_links = links;
        if (includeText !== "" || includeExtension !== "no_extension") {
            filtering_links = links.filter(link => {
                const filename = getFileNameFromUrl(link);
                if (filename === "") return false;

                if (
                    (includeExtension !== "no_extension" && !filename.endsWith(includeExtension)) ||
                    (includeText !== "" && filename.includes(includeText) !== mustInclude)
                ) {
                    return false;
                }

                return true;
            });
            return filtering_links
        }
    }

    document.getElementById('pdm_cancel_modal').onclick = function () {
        dismissModal([], false)
    }

    const conditionTypeSelectOption = document.getElementById("pdm_include_or_exclude");
    const includeSelectOption = document.getElementById("pdm_include_extension");
    const includeTextDom = document.getElementById("pdm_text");

    conditionTypeSelectOption.onchange = doFilter;
    includeSelectOption.onchange = doFilter;
    includeTextDom.input = doFilter;


    function doFilter() {
        filteredLinks = filterLinks()
        console.log(filteredLinks)
    }

    showPdmModal(extensions);

    document.getElementById('pdm_captuare_links').onclick = function () {
        dismissModal(filteredLinks, true)
    }

    document.addEventListener('keypress', (event) => {
        if (event.code === "Enter") {
            dismissModal(filteredLinks, true)
        } else if (event.code === "Escape") {
            dismissModal(filteredLinks,false)
        }
    })
}


