/*
* pdm-chrome-wrapper (forked from uget-chrome-wrapper ) is an extension to integrate PDM Download manager
* with Google Chrome, Chromium and Vivaldi in Linux and Windows.
*
* Copyright (C) 2016  Gobinath
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


if(typeof browser !== 'undefined' )
    BrowserNameSpace = browser ;
else if(typeof chrome !== 'undefined' )
    BrowserNameSpace = chrome;


let keywordsDom,dlInterruptCheckBox, contextMenuCheckbox;


function saveSettings() {
    let keywords = keywordsDom.val();
    let interrupt = dlInterruptCheckBox.prop('checked');
    let contenxtMenu = contextMenuCheckbox.prop('checked');



    BrowserNameSpace.runtime.getBackgroundPage(function(backgroundPage) {

        backgroundPage.setInterruptDownload(interrupt);

        localStorage["keywords"] = keywords;
        backgroundPage.updateKeywords(keywords);

        let config = backgroundPage.getExtensionConfig();

        if(contenxtMenu != config['context-menu']){
            localStorage["context-menu"] = contenxtMenu;
            backgroundPage.setContextMenu(contenxtMenu);
        }
    });
}

//Do after load
$(document).ready(function () {

    BrowserNameSpace.runtime.getBackgroundPage(function(backgroundPage) {
        let config = backgroundPage.getExtensionConfig();

        //Init variables from config
        keywordsDom = $('#keywords');
        dlInterruptCheckBox = $('#chk-interrupt');
        contextMenuCheckbox = $('#context_menu');

        // let interrupt = (localStorage["pdm-interrupt"] == "true");
        dlInterruptCheckBox.prop('checked', config['pdm-interrupt']);

        // let contextMenu = (localStorage['context-menu'] == 'true');
        contextMenuCheckbox.prop('checked', config['context-menu']);
        keywordsDom.val(config['keywords']);


        //Listen on changes and save them immediately
        dlInterruptCheckBox.on("change",saveSettings);
        // keywordsDom.on("change",saveSettings);

        keywordsDom.on("change paste keyup", saveSettings);
        contextMenuCheckbox.on("change",saveSettings);

        // saveSettings();
    });


});
