/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/**
 * Connect to the background script and send initialization message.
 * This first message is needed to properly pair connection within
 * the background script relay logic.
 */
var port = chrome.runtime.connect(null, { name: "content" });
port.postMessage({});

/**
 * Listen for incoming messages from the devtools scope.
 */
function onMessage(message) {
  if (!message) {
    console.error("ERROR: message object doesn't exist!");
    return;
  }

  switch (message.action) {
    case "getHAR":
      onHarReceived(message);
      break;
    case "requestFinished":
      onRequestFinished(message);
      break;
  }
};

port.onMessage.addListener(onMessage);

/**
 * Listen for disconnect and clean up listeners.
 */
port.onDisconnect.addListener(function() {
  port.onMessage.removeListener(onMessage);
  port = null;

  document.removeEventListener("HAR.addRequestListener", onAddRequestListener, false);
  document.removeEventListener("HAR.triggerExport", onTriggerExport, false);
  document.removeEventListener("HAR.removeRequestListener", onRemoveRequestListener, false);
});

// Handle messages from the devtools scope.

/**
 * Receive HAR log from DevTools script, remove related
 * promise from `exportsInProgress` map and resolve it.
 */
function onHarReceived(message) {
  let {
    actionId,
    har
  } = message;

  // Make sure to instantiate the `detail` object with the
  // right privileges (using target page window).
  let detail = new window.Object();
  detail.actionId = actionId;
  detail.harLog = har ? JSON.stringify(har) : null;

  let e = new window.CustomEvent("HAR.triggerExport-Response", {
    detail: detail
  });
  document.dispatchEvent(e);
}

/**
 * Handles `onRequestFinished` message from the devtools scope
 * and passes HAR data (related to the finished request) back
 * to the page scope.
 */
function onRequestFinished(message) {
  let detail = new window.Object();
  detail.request = message.request;

  let e = new window.CustomEvent("HAR.onRequestFinished", {
    detail: detail
  });
  document.dispatchEvent(e);
}

// Handle messages from the page scope (DOM events).

/**
 * Handle requests/events for HAR from the page scope. The result
 * HAR object will be received from devtools scope and send back
 * to the page scope in `onHarReceived`.
 */
function onTriggerExport(event) {
  let {
    actionId,
    options,
  } = event.detail;

  port.postMessage({
    actionId: actionId,
    action: "getHAR",
  });
}

/**
 * Register `onRequestFinished` listener
 */
function onAddRequestListener(event) {
  port.postMessage({
    action: "addRequestListener",
  });
}

/**
 * Unregister `onRequestFinished` listener
 */
function onRemoveRequestListener(event) {
  port.postMessage({
    action: "removeRequestListener",
  });
}

document.addEventListener("HAR.addRequestListener", onAddRequestListener, false);
document.addEventListener("HAR.triggerExport", onTriggerExport, false);
document.addEventListener("HAR.removeRequestListener", onRemoveRequestListener, false);

/**
 * Inject harapi.js file into the page automatically. Note that
 * `cloneInto` can't be used since it's only supported by Firefox,
 * and so let's inject a <script> tag pointing to the harapi.js file.
 */
(function(d, id){
  var js, fjs = d.head;
  if (d.getElementById(id)) { return; }
  js = d.createElement('script');
  js.id = id;
  js.src = chrome.runtime.getURL("/lib/harapi.js");
  fjs.parentNode.insertBefore(js, fjs);
}(document, "harapi"));