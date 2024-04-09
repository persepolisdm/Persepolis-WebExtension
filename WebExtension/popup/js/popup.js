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


function setExtensionConfig() {
    let keywords = keywordsDom.val();
    let pdmInterrupt = dlInterruptCheckBox.prop('checked');
    let contextMenu = contextMenuCheckbox.prop('checked');


    BrowserNameSpace.runtime.sendMessage({
        type: "setExtensionConfig",
        data: {
            pdmInterrupt, contextMenu, keywords 
        }
    })

}

//Do after load
$(document).ready(function () {

    BrowserNameSpace.runtime.sendMessage({ type: "getExtensionConfig" }, (config) => {
        let { pdmInterrupt, contextMenu, keywords } = config

        //Init variables from config
        keywordsDom = $('#keywords');
        dlInterruptCheckBox = $('#chk-interrupt');
        contextMenuCheckbox = $('#context_menu');

        dlInterruptCheckBox.prop('checked', pdmInterrupt);

        contextMenuCheckbox.prop('checked', contextMenu);
        keywordsDom.val(keywords);


        //Listen on changes and save them immediately
        dlInterruptCheckBox.on("change", setExtensionConfig);
        // keywordsDom.on("change",saveSettings);

        keywordsDom.on("change paste keyup", setExtensionConfig);
        contextMenuCheckbox.on("change", setExtensionConfig);
    });


});
