

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

        <div style="margin: 15px; font-size: 1.5em; color:#00897b">Filter group downloads</div>
        <div class="form">
            <div class="pdm-inputs">
                
                <select id="pdm_include_or_exclude" class="pdm-select">
                    <option value="include"> Have </option>
                    <option value="exclude"> Not Have </option>
                </select>
                
                <input placeholder="in filename" type="text" id="pdm_text" class="pdm-input">

               <select id="pdm_include_extension" class="pdm-select">
                            
               </select>
            
<!--                <pdmtable>&lt;!&ndash; LOL xD&ndash;&gt;-->
<!--                    <pdmtr>-->
<!--                        <pdmtd>Include:</pdmtd>-->
<!--                        <pdmtd><input placeholder="Must have in filename" type="text" id="pdm_include_text" class="pdm-input"></pdmtd>-->
<!--                        <pdmtd><select id="pdm_include_extension" class="pdm-select">-->
<!--                            <option value="-1"> Select extension</option>-->
<!--                        </select></pdmtd>-->
<!--                    </pdmtr>-->
<!--                    <pdmtr>-->
<!--                        <pdmtd>Exclude:</pdmtd>-->
<!--                        <pdmtd><input placeholder="Must not have in filename" type="text" id="pdm_exclude_text" class="pdm-input"></pdmtd>-->
<!--                        <pdmtd><select id="pdm_exclude_extension" class="pdm-select">-->
<!--                            <option value="-1"> Select extension</option>-->
<!--                        </select></pdmtd>-->
<!--                    </pdmtr>-->
<!--                </pdmtable>-->
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
        let options = `<option value="no_extension">Select Extension</option>`;
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
    document.getElementById('pdm_captuare_links').onclick = function(){
        debugger;
        const conditionTypeSelectOption = document.getElementById("pdm_include_or_exclude");
        const conditionValue = conditionTypeSelectOption.options[conditionTypeSelectOption.selectedIndex].value;
        const includeSelectOption = document.getElementById("pdm_include_extension");
        const includeExtension = includeSelectOption.options[includeSelectOption.selectedIndex].value;
        const includeText = document.getElementById("pdm_text").value.trim();

        let mustInclude = conditionValue === "include";

        if(includeText!==""  || includeExtension !== "no_extension")
            links = links.filter(link=>{
                const filename = getFileNameFromUrl(link);

                if (
                    (includeExtension !== "no_extension" && filename.endsWith(includeExtension) !== mustInclude) ||
                    (includeText !== "" && filename.includes(includeText) !== mustInclude)
                ){
                    return false;
                }

                return true;
            });
        removeModal();
        //Send html selection back to extension
        sendToExtension(links);
    };
    showModal(extensions);

}
