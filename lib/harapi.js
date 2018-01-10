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
 * Include it into your *.html to enable HAR API.
 *
 * Example:
 *
 * HAR.triggerExport(options).then(function(harLog) {
 *   console.log(harLog);
 * });
 */
(function(win) {
  if (typeof win.HAR == "undefined") {
    let id = 0;
    let callsInProgress = new Map();

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
    };

    // Response event handlers
    document.addEventListener("HAR.triggerExport-Response", function(event) {
      let { actionId, harLog } = event.detail;
      harLog = JSON.parse(harLog);
      let resolve = callsInProgress.get(actionId);
      if (resolve) {
        callsInProgress.delete(actionId);
        resolve(harLog);
      } else {
        console.log("HAR API: Unknown HAR response!", event);
      }
    });
  }
})(window);
