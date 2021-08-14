{
    let BrowserNameSpace;
    if (typeof BrowserNameSpace === "undefined") {
        if (typeof browser !== 'undefined')
            BrowserNameSpace = browser;
        else if (typeof chrome !== 'undefined')
            BrowserNameSpace = chrome;
    }

    let usedLinks = {}; // Store unique keys only using a hashmap.
    let links = [];
    let filteredLinks = [];
    let uncheckedLinkIndexes = [];
    const extensions = {}; // Create object of url extensions

    const nodes = document.querySelectorAll("a");
    for (let i = 0; i < nodes.length; i++) {
        let l = nodes[i].href.trim();

        if (l !== "" && !(l in usedLinks) && !l.startsWith("mailto")) {
            usedLinks[l] = true; //Add link to used link so we won't use it again
            links.push(l);
            const extension = getExtensionOfUrl(l).toLowerCase();
            if (extension !== "")
                extensions[extension] = true;
        }
    }



    function filterLinks() {
        const conditionValue = conditionTypeSelectOption.options[conditionTypeSelectOption.selectedIndex].value;
        const includeExtension = includeSelectOption.options[includeSelectOption.selectedIndex].value;
        const includeText = includeTextDom.value.trim().toLowerCase(); //TODO: Add case sensitive
        let mustInclude = conditionValue === "include";
        let filtering_links = links;
        if (includeText !== "" || includeExtension !== "no_extension") {
            filtering_links = links.filter(link => {
                const filename = link.toLowerCase(); //TODO: Add case sensitive
                // const filename = getFileNameFromUrl(link).toLowerCase();
                // if (filename === "") return false;

                //Extension condiftion
                if (includeExtension !== "no_extension" && filename.includes("." + includeExtension) !== mustInclude)
                    return false;

                // Text include condition
                if (includeText !== "" && filename.includes(includeText) !== mustInclude)
                    return false;


                return true;
            });
        }
        return filtering_links
    }

    document.getElementById('pdm_cancel_modal').onclick = function () {
        dismissModal([], false)
    }

    const conditionTypeSelectOption = document.getElementById("pdm_include_or_exclude");
    const includeSelectOption = document.getElementById("pdm_include_extension");
    const includeTextDom = document.getElementById("pdm_text");
    const pdmPreviewLinks = document.getElementById("pdm-preview-links");
    const pdmLinkCount = document.getElementById("pdm-link-count");
    //TODO: Add case-sensitive option

    conditionTypeSelectOption.onchange = doFilter;
    includeSelectOption.onchange = doFilter;
    includeTextDom.oninput = doFilter;

    function doFilter() {
        filteredLinks = filterLinks();
        uncheckedLinkIndexes = [];
        pdmPreviewLinks.innerHTML ='';
        filteredLinks.map((link, index)=>{

            const pdmLink = document.createElement("pdmlink");
            const checkboxId = `pdm-link-id-${index}`;


            const checkbox = document.createElement("input");
            checkbox.id = checkboxId;
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            // checkbox['urlIndex'] = index;
            checkbox.onchange = function (){
                let change = 0;
                if(this.checked){
                    uncheckedLinkIndexes = uncheckedLinkIndexes.filter(item=> item !== index)
                    change++;
                }else{
                    uncheckedLinkIndexes.push(index);
                    change--;
                }
                pdmLinkCount.innerText = Number(pdmLinkCount.innerText) + change
            };

            const label = document.createElement("label");
            label.htmlFor = checkboxId;
            try{
                label.textContent = decodeURIComponent(link);
            }catch (e) {
                label.textContent = link;
            }

            pdmLink.appendChild(checkbox);
            pdmLink.appendChild(label);
            pdmPreviewLinks.appendChild(pdmLink);
        });
        pdmLinkCount.innerHTML = filteredLinks.length+""
    }

    function getFinalCheckedLinks(){
        return filteredLinks.filter((link,index) => !uncheckedLinkIndexes.includes(index) )
    }

    document.getElementById('pdm_captuare_links').onclick = function () {
        dismissModal(getFinalCheckedLinks(), true)
    }

    // uncheckedLinkIndexes.push()


    includeTextDom.onkeyup = (e)=>{
        shortcutHandler(
            e,
            ()=>{dismissModal(getFinalCheckedLinks(), true)},
            ()=>{dismissModal([], false) }
        )
    };

    setTimeout(doFilter, 0);
    showPdmModal(extensions);

}