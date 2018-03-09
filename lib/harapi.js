/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/**
 * Client HAR API
 *
 * `cloneInto` - export an object to page scripts is not supported in Chrome.
 * It's supported in Firefox, see also:
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts#cloneInto
 *
 * This file implements HAR API based on communication through `dispatchEvent`.
 * It's included automatically into your *.html (using injected script tag)
 * to provide nice HAR API.
 *
 * Examples:
 *
 * HAR.triggerExport(options).then(function(harLog) {
 *   console.log(harLog);
 * });
 *
 * It is also possible to listen for finished requests.
 *
 * HAR.addRequestListener(request => {
 *   console.log(request),
 * });
 *
 */
(function(win) {
  if (typeof win.HAR == "undefined") {
    let id = 0;
    let callsInProgress = new Map();
    let onRequestFinishedListeners = new Set();

    /**
     * Implementation of HAR API. This object represents a wrapper
     * around various DOM messages sent between the page and
     * HARTriggerExport extension.
     */
    win.HAR = {
      triggerExport: function(options) {
        return new window.Promise(function(resolve) {
          let actionId = ++id;
          callsInProgress.set(actionId, resolve);

          let event = new window.CustomEvent("HAR.triggerExport", {
            detail: {
              actionId: actionId,
              options: options,
            }
          });

          document.dispatchEvent(event);
        });
      },
      addRequestListener: function(listener) {
        onRequestFinishedListeners.add(listener);

        // Register `onRequestFinished` listener on the backend.
        // The backend listener is registered dynamically since
        // it represents performance bottleneck.
        // All HTTP details data related to the finished request
        // needs to be fetched from the RDP server and passed to
        // the listener.
        // So, don't do it if the page doesn't need it.
        if (onRequestFinishedListeners.size == 1) {
          let event = new window.CustomEvent("HAR.addRequestListener");
          document.dispatchEvent(event);
        }
      },
      removeRequestListener: function(listener) {
        onRequestFinishedListeners.delete(listener);

        // Unregister backend listener if it isn't needed anymore.
        if (onRequestFinishedListeners.size == 0) {
          let event = new window.CustomEvent("HAR.removeRequestListener");
          document.dispatchEvent(event);
        }
      },
    };

    /**
     * Handle responses for `HAR.triggerExport` messages.
     */
    document.addEventListener("HAR.triggerExport-Response", function(event) {
      let { actionId, harLog } = event.detail;
      harLog = harLog ? JSON.parse(harLog) : null;
      let resolve = callsInProgress.get(actionId);
      if (resolve) {
        callsInProgress.delete(actionId);
        resolve(harLog);
      } else {
        console.log("HAR API: Unknown HAR response!", event);
      }
    });

    /**
     * Handle `HAR.onRequestFinished` send when HTTP request finished.
     */
    document.addEventListener("HAR.onRequestFinished", function(event) {
      onRequestFinishedListeners.forEach(listener => {
        listener(JSON.parse(event.detail.request));
      })
    });
  }
})(window);
