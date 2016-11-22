var query = {};	// flash query params to query the video url
var regex = /(file|max_vid|seccode)=(\w+)&/g;
var flashParams = document.getElementsByClassName('videoplayer')[0].getElementsByTagName('embed')[0].attributes.flashvars;

var matched;
while ((matched = regex.exec(flashParams.textContent)) !== null) {
	console.log(matched);
	if (matched[1] === 'file') {
		query['VID'] = matched[2];
	} else {
		query[matched[1]] = matched[2];
	}
}
if (query.VID && query.seccode && query.max_vid) {
	// https://developer.chrome.com/extensions/messaging
	// send message to popup/background script
	chrome.runtime.sendMessage(query, function(response) {
		console.log(response);
	});
}
console.log('content script init');

