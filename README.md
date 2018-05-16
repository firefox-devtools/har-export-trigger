# HARExportTrigger
Trigger HAR export any time directly from within a page.

WebExtension improving automated HAR (HTTP Archive) export of collected data from the Network panel. This extension is built on top of WebExtensions DevTools API (compatible with Firefox and Chrome).

The extension exports HAR API directly to the page. Any automated system can be consequently built on top of the API and trigger HAR export using a simple JavaScript call at any time. It can be also nicely integrated with e.g. Selenium to implement automated HAR export robots for existing automated test suites.

## Installation
This extension must be installed from source at this point.
1. Clone or download source code in this repository to your machine.
2. Launch [Firefox Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly) and open `about:debugging` page
3. Click `Load Temporary Add-on` and pick any file from the root source code directory (e.g. `manifest.json`
4. Re-open an existing DevTools Toolbox to make sure the extension is properly loaded by Firefox DevTools.

You might also use `web-ext` command line tool. Read more on [MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext).

## Directory Structure
Quick description of the directory structure in this project.

* `src` - source files
* `res` - icons, styles, etc.
* `lib` - HAR client API files

## Requirements
You need Firefox 60+ to run this extension.

The following Firefox bugs are related:
* [~~Bug 1311177~~](https://bugzilla.mozilla.org/show_bug.cgi?id=1311177) - (fixed in Firefox 60) Implement the devtools.network.getHAR API method
* [~~Bug 1311171~~](https://bugzilla.mozilla.org/show_bug.cgi?id=1311171) - (fixed in Firefox 60) Implement the devtools.network.onRequestFinished API event
* [~~Bug 1436665~~](https://bugzilla.mozilla.org/show_bug.cgi?id=1436665) - (fixed in Firefox 61) onRequestFinished event should be sent even if the Netmonitor UI isn't initialized
* [~~Bug 1434855~~](https://bugzilla.mozilla.org/show_bug.cgi?id=1434855) - (fixed in Firefox 60) HAR export is very slow

## Scopes
There are following scopes related to the architecture of this extension.

1) Page scope - This is where your page is running. This scope also includes
                harapi.js file (see lib dir in this repo) and eg triggers HAR export.
2) Content scope - This scope is responsible for handling messages from the page
                   and communicating with the DevTools scope.
3) Background scope - Background scope is responsible for relaying messages
                      between Content and Devtools scopes.
4) Devtools scope - This scope is responsible for accessing DevTools
                    WebExtension API and sending results back to content scope.

## How To Use
Install the extension into your browser (Firefox & Chrome supported).
HAR API implemented in `harapi.js` file is automatically injected
into your page (the file is available in `lib` directory in this repo).

An example script looks like as follows:

```
HAR.triggerExport().then(harLog => {
  console.log(harLog);
});

HAR.addRequestListener(harEntry => {
  console.log("Request finished", request);
});

```

See also online [test page](http://softwareishard.com/test/harexporttrigger/).

## Further Resources
* Test page for HARExportTrigger: http://softwareishard.com/test/harexporttrigger/
* HAR Spec: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html
* HAR Spec (original): http://www.softwareishard.com/blog/har-12-spec/
* HTTP Archive Viewer: http://www.softwareishard.com/blog/har-viewer/
* HAR Discussion Group: http://groups.google.com/group/http-archive-specification/
