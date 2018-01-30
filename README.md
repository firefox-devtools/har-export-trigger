# HARExportTrigger
Trigger HAR export any time directly from within a page.

WebExtension improving automated HAR (HTTP Archive) export of collected data from the Network panel. This extension is built on top of WebExtensions DevTools API (compatible with Firefox and Chrome).

The extension exports HAR API directly to the page. Any automated system can be consequently built on top of the API and trigger HAR export using a simple JavaScript call at any time. It can be also nicely integrated with e.g. Selenium to implement automated HAR export robots for existing automated test suites.

## Directory Structure
Quick description of the directory structure in this project.

* `src` - source files
* `res` - icons, styles, etc.
* `lib` - HAR client API files

## Requirements
You need Firefox 59+ to run this extension.

The following bug needs to be fixed yet:
* Bug 1311177 - Implement the devtools.network.getHAR API method

## Scopes
There are following scopes related to the architecture of this extension.

1) Page scope - This is where your page is running. This scope also includes
                harapi.js file and eg triggers HAR export.
2) Content scope - This scope is responsible for handling messages from the page
                   and communicating with the DevTools scope.
3) Background scope - Background scope is responsible for relaying messages
                      between Content and Devtools scopes.
4) Devtools scope - This scope is responsible for accessing DevTools
                    WebExtension API and sending results back to content scope.

## How To Use
Install the extension into your browser (Firefox & Chrome supported)
and include `harapi.js` into your page (the file is available in `lib`
directory in this repo).

An example script looks like as follows:

```
<script type="text/javascript" src="harapi.js"></script>

HAR.triggerExport().then(harLog => {
  console.log(harLog);
});
```

## Further Resources
* HAR Spec: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html
* HAR Spec (original): http://www.softwareishard.com/blog/har-12-spec/
* HTTP Archive Viewer: http://www.softwareishard.com/blog/har-viewer/
* HAR Discussion Group: http://groups.google.com/group/http-archive-specification/
