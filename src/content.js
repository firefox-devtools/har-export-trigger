/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

console.log("content-script: LOAD");

var port;

/**
 * Lazily setup port for communication with the background script
 * and send initialization message.
 */
function setupPortIfNeeded() {
  if (!port) {
    port = chrome.runtime.connect(null, { name: "content" });

    // Listen for disconnect.
    port.onDisconnect.addListener(function() {
      port = null;
      window.removeEventListener("message", onMessage);
    });

    // Listen for incoming messages
    port.onMessage.addListener(function(message) {
      if (message && message.har) {
        onHarDone(message);
      }

      if (message && message.request) {
        onRequestFinished(message);
      }
    });
  }
}

document.addEventListener("HAR.triggerExport", function(event) {
  setupPortIfNeeded();

  let {
    actionId,
    options,
  } = event.detail;

  port.postMessage({
    actionId: actionId,
    action: "getHAR",
  });
}, false);


/**
 * Receive HAR log from DevTools script, remove related
 * promise from `exportsInProgress` map and resolve it.
 */
function onHarDone(message) {
  let {
    actionId,
    har
  } = message;

  // Make sure to instantiate the `detail` object with the
  // right privileges (using target page window).
  let detail = new window.Object();
  detail.actionId = actionId;
  detail.harLog = JSON.stringify(har);

  let e = new window.CustomEvent("HAR.triggerExport-Response", {
    detail: detail
  });

  document.dispatchEvent(e);
}

function onRequestFinished(message) {
  let {
    request
  } = message;

  let detail = new window.Object();
  detail.request = JSON.stringify(request);

  let e = new window.CustomEvent("HAR.onRequestFinished", {
    detail: detail
  });

  document.dispatchEvent(e);
}
