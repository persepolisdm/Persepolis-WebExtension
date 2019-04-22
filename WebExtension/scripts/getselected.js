

{
    if(typeof BrowserNameSpace === "undefined"){
        BrowserNameSpace;
        if(typeof browser !== 'undefined' )
            BrowserNameSpace = browser ;
        else if(typeof chrome !== 'undefined' )
            BrowserNameSpace = chrome;
    }

    function injectModal() {
        const html = `
<div id="pdm-modal-holder" class="pdm-modal-holder-hide">
    <div id="pdm-modal">
        <div class="pdm-header">
            <div class="pdm-logo"></div>
            <span> Persepolis Download Manager</span>
        </div>

        <div style="margin: 15px; font-size: 1.5em; color:#00897b">Filter batch downloads</div>
        <div class="form">
            <div class="pdm-inputs">
                <pdmtable><!-- LOL xD-->
                    <pdmtr>
                        <pdmtd>Include:</pdmtd>
                        <pdmtd><input placeholder="Must have in filename" type="text" id="pdm_include_text" class="pdm-input"></pdmtd>
                        <pdmtd><select id="pdm_include_extension" class="pdm-select">
                            <option value="-1"> Select extension</option>
                        </select></pdmtd>
                    </pdmtr>
                    <pdmtr>
                        <pdmtd>Exclude:</pdmtd>
                        <pdmtd><input placeholder="Must not have in filename" type="text" id="pdm_exclude_text" class="pdm-input"></pdmtd>
                        <pdmtd><select id="pdm_exclude_extension" class="pdm-select">
                            <option value="-1"> Select extension</option>
                        </select></pdmtd>
                    </pdmtr>
                </pdmtable>
            </div>
        </div>
        <div class="pdm-actions">
            <pdminput id="pdm_captuare_links"> Capture Links! </pdminput>
            <pdminput id="pdm_cancel_modal"> Cancel </pdminput>
        </div>
    </div>
</div>`;

        document.body.insertAdjacentHTML('beforeend', html);

    }
    function showModal(extensions) {
        const modalHolder = document.getElementById('pdm-modal-holder');
        const modal = document.getElementById('pdm-modal');
        setTimeout( ()=> modal.classList.add("pdm-animate-down"),
            100);
        modalHolder.classList.remove('pdm-modal-holder-hide');
        const includeSelectOption = document.getElementById("pdm_include_extension");
        const excludeSelectOption = document.getElementById("pdm_exclude_extension");
        let options = `<option value="-1">Select Extension</option>`;
        for( let k of Object.keys(extensions)){
            options+=`<option value="${k}">${k}</option>`;
        }
        includeSelectOption.innerHTML = options;
        excludeSelectOption.innerHTML = options;

        // document.body.classList.add('pdm-blurer');
    }
    function removeModal() {
        const modalHolder = document.getElementById('pdm-modal-holder');
        modalHolder.classList.add('pdm-modal-holder-hide');
        const holder = document.getElementById("pdm-modal-holder");
        holder.parentNode.removeChild(holder); // This syntax for delete dom is really dumb as fuck !
    }
    function getFileNameFromUrl(link) {
        return link.split('/').pop().split('#')[0].split('?')[0];
    }
    function getExtensionOfUrl(link) {
        const filename = getFileNameFromUrl(link);
        const dotPos = filename.lastIndexOf(".");
        if(dotPos===-1) return null;
        return filename.substring(dotPos);
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
    let extensions = {}; // Create object of url extensions
    for(let i=0;i<nodes.length;i++){
        let l = nodes[i].href.trim();
        if (l !== "" || l.startsWith("mailto")){
            links.push(l);

            const extension = getExtensionOfUrl(l);
            if(extension)
                extensions[extension] = true;
        }
    }

    injectModal();
    document.getElementById('pdm_cancel_modal').onclick = function(){
        removeModal();
    };
    showModal(extensions);

    document.getElementById('pdm_captuare_links').onclick = function(){
        const includeSelectOption = document.getElementById("pdm_include_extension");
        const excludeSelectOption = document.getElementById("pdm_exclude_extension");
        const includeExtension = includeSelectOption.options[includeSelectOption.selectedIndex].value;
        const excludeExtension = excludeSelectOption.options[excludeSelectOption.selectedIndex].value;

        const includeText = document.getElementById("pdm_include_text").value.trim();
        const excludeText = document.getElementById("pdm_exclude_text").value.trim();
        console.log(includeText);
        links = links.filter(link=>{
            const filename = getFileNameFromUrl(link);
            if(includeExtension != -1 && !filename.endsWith(includeExtension) ){
                return false;
            }
            if(includeText != "" && !filename.includes(includeText)){
                return false;
            }
            if(excludeExtension != -1 && filename.endsWith(includeExtension)){
                return false;
            }
            if(excludeText != "" && filename.includes(includeText)){
                return false;
            }
            return true;
        });
        removeModal();
        //Send html selection back to extension
        let __ = {};
        sendToExtension(links);
        __;
    };

}
