if (typeof BrowserNameSpace === "undefined") {
    if (typeof browser !== 'undefined')
        BrowserNameSpace = browser;
    else if (typeof chrome !== 'undefined')
        BrowserNameSpace = chrome;
}

function injectPdmModal(){
    const html = `
<div id="pdm-modal-holder" class="pdm-modal-holder-hide">
    <div id="pdm-modal">
        <div class="pdm-header">
            <div class="pdm-logo"></div>
            <span> Persepolis Download Manager</span>
        </div>

        <div id="pdm_filter_title" style="margin: 15px; font-size: 1.5em; color:#00897b">Filter group downloads</div>
        <div class="form">
            <div class="pdm-inputs">
                
                <select id="pdm_include_or_exclude" class="pdm-select" style="display: inline-block">
                    <option value="include"> Include</option>
                    <option value="exclude"> Exclude </option>
                </select>
                
                <input placeholder="in filename" type="text" id="pdm_text" class="pdm-input" style="display: inline-block">

               <select id="pdm_include_extension" class="pdm-select" style="display: inline-block">
                            
               </select>
            </div>
        </div> 
        <div class="pdm-actions">
            <pdminput id="pdm_captuare_links"> Capture <pdmlinkcount id="pdm-link-count"></pdmlinkcount> Links! </pdminput>
            <pdminput id="pdm_cancel_modal"> Cancel </pdminput>
        </div>
        <div id="pdm-preview-links">
        </div>
    </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);

}

function showPdmModal(extensions) {
    const modalHolder = document.getElementById('pdm-modal-holder');
    const modal = document.getElementById('pdm-modal');
    setTimeout( ()=> modal.classList.add("pdm-animate-down"),
        100);
    modalHolder.classList.remove('pdm-modal-holder-hide');
    const includeSelectOption = document.getElementById("pdm_include_extension");
    let options = `<option value="no_extension">Select Extension</option>`;
    for( let k of Object.keys(extensions)){
        options+=`<option value="${PdmSanitizeHTML(k)}">${PdmSanitizeHTML(k)}</option>`;
    }
    includeSelectOption.innerHTML = options;

    // document.body.classList.add('pdm-blurer');
}

function PdmSanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
function removePdmModal() {
    // const modalHolder = document.getElementById('pdm-modal-holder');
    // modalHolder.classList.add('pdm-modal-holder-hide');
    const holder = document.getElementById("pdm-modal-holder");
    holder.parentNode.removeChild(holder); // This syntax for delete dom is really dumb as fuck !
}
function getFileNameFromUrl(link) {
    let possibleFileName = link.split('/').pop().split('#')[0].split('?')[0].trim();
    try{
        return decodeURIComponent(possibleFileName);
    }catch (e) {
        return possibleFileName;
    }
}
function getExtensionOfUrl(link) {
    const tempFileName = getFileNameFromUrl(link);
    let filename = tempFileName === "" ? link : tempFileName ;
    const dotPos = filename.lastIndexOf(".");
    if(dotPos===-1)
        return "";
    filename = filename.substr(dotPos+1, 4);

    return !filename.match(/^([0-9a-z]+)$/i) || !isNaN(filename) ? "" : filename;
}

function sendToExtension(msg) {
    BrowserNameSpace.runtime.sendMessage({
        type:"getSelected",
        message: msg
    });
}
function dismissModal(links, success) {
    if(success)
        sendToExtension(links);
    removePdmModal();

}
function shortcutHandler(event, onSucess, onFail){
    if (event.code === "Enter") {
        onSucess()
    } else if (event.code === "Escape") {
        onFail()
    }
}
injectPdmModal();
