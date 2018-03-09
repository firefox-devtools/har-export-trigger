/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/**
 * Connect to the background script and send initialization message.
 * This first message is needed to properly pair connection within
 * the background script relay logic.
 */
var port = chrome.runtime.connect({ name: "devtools" });
port.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId
});

/**
 * Listen for message sent from the content scope (they are relayed
 * by background script).
 */
function onMessage(message) {
  if (!message) {
    console.error("ERROR: message object doesn't exist!");
    return;
  }

  switch (message.action) {
    case "getHAR":
      onGetHAR(message);
      break;
    case "addRequestListener":
      onAddRequestListener();
      break;
    case "removeRequestListener":
      onRemoveRequestListener();
      break;
  }
}

port.onMessage.addListener(onMessage);

/**
 * Listen for disconnect and clean up listeners.
 */
port.onDisconnect.addListener(function() {
  port.onMessage.removeListener(onMessage);
  port = null;
});

function onGetHAR(message) {
  chrome.devtools.network.getHAR(function(harLog) {
    port.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      har: harLog,
      action: "getHAR",
      actionId: message.actionId,
    });
  });
}

var listenerAdded = false;

function onAddRequestListener() {
  if (!listenerAdded) {
    listenerAdded = true;
    chrome.devtools.network.onRequestFinished.addListener(onRequestFinished);
  }
}

function onRemoveRequestListener() {
  if (listenerAdded) {
    listenerAdded = false;
    chrome.devtools.network.onRequestFinished.removeListener(onRequestFinished);
  }
}

/**
 * Handles `onRequestFinished` event and sends HAR (with request
 * related data) to the content scope.
 */
function onRequestFinished(request) {
  request.getContent(function (content, encoding) {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
      return;
    }

    delete request.response.content.comment;
    request.response.content.text = content;

    port.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      action: "requestFinished",
      request: JSON.stringify(request),
    });
  });

  // Alternate way using the returned promise to get
  // the response content.
  //
  // request.getContent().then(([content, encoding]) => {
  //   console.log("result content ", content);
  //   console.log("result encoding ", encoding);
  // }).catch(err => {
  //   console.log(chrome.runtime.lastError);
  // });
};
