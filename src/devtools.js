/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

console.log("devtools-script: LOAD");

/**
 * Connect to the background script.
 */
var port = chrome.runtime.connect({ name: "devtools" });

/**
 * Listen for message from the content
 * (forwarded by background script)
 */
port.onMessage.addListener(function (message) {
  console.log("devtools-script: onMessage", message);

  if (message && message.action === "getHAR") {
    chrome.devtools.network.getHAR(function(harLog) {
      console.log("harLog", harLog);

      port.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        har: harLog,
        actionId: message.actionId,
      });
    });
  }
});

// Relay the tab ID to the background page.
port.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId
});
