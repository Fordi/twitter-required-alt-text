Twitter Require Alt Text
------------------------

Small extension that will force you to add alt text to images when tweeting.

Prior art: https://addons.mozilla.org/en-US/firefox/addon/twitter-required-alt-text/

This is my Chrome-compatible adaptation of the above, with the following changes:

* Internationalization for 10 languages
* Primary mutation observer is debounced (to avoid blocking the render thread)
* Handlers are more efficient, using `matches` and `querySelector` where possible instead of `querySelectorAll`
* More source commentary

## Basic installation

### Chrome / Chromium

* Get the latest release zip for Chrome from [here](https://github.com/Fordi/twitter-required-alt-text/releases/latest) and unzip somewhere you're not going to delete.  You can also just clone this repository.
* in Chrome/Chromium, go to `chrome://extensions`
* flip on "Developer mode" in the upper right-hand corner
* click "Load unpacked"
* Browse to the folder of the unzipped package

### Firefox

* Get the latest release zip for Firefox from [here](https://github.com/Fordi/twitter-required-alt-text/releases/latest) and unzip somewhere stable.  You can also clone this repo.
* In Firefox, browse to `about:debugging`
* Click "This Firefox"
* Click "Load Temprary Add-on"
* Browse to the folder of the unzipped package
* Select `manifest.json`

### Development

You can modify most files in this repo and see the changes live.  Exceptions:

* `manifest.json`, `extension.js` - changes to these files require you to reload the extension
* Adding new files to be imported or displayed will require you to add their paths to `web_accessible_resources` in `manifest.json`
