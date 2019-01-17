/*
* uget-chrome-wrapper is an extension to integrate uGet Download manager
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

var BrowserNameSpace;
if(typeof browser !== 'undefined' )
    BrowserNameSpace = browser ;
else if(typeof chrome !== 'undefined' )
    BrowserNameSpace = chrome;


function sendToExtension(msg) {
    BrowserNameSpace.runtime.sendMessage({
        type: "keyPress",
        message: msg
    });
}


const temoraory_disable_keys = ["Insert", "Backquote"];
window.onkeydown = function(event) {
    if (temoraory_disable_keys.includes(event.code)) { // Insert
        sendToExtension('disable');
    }
};

window.onkeyup = function(event) {
    if (temoraory_disable_keys.includes(event.code)) { // Insert
        sendToExtension('enable');
    } else if (event.code === "KeyU" && event.ctrlKey && event.shiftKey) { // Ctrl + Shift + U
        sendToExtension('toggle');
    }
};
