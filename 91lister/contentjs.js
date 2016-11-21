function getParams() {
	return {seccode: so.variables.seccode, VID: so.variables.file, max_vid: so.variables.max_vid};
}

// https://developer.chrome.com/extensions/messaging
chrome.runtime.sendRequest(getParams(), function(response) {
	console.log(response);
});
