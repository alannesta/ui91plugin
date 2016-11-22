function getParams() {
	return {seccode: window.so.variables.seccode, VID: window.so.variables.file, max_vid: window.so.variables.max_vid};
}

var regex = /(file|max_vid|seccode)=(.*?)&/g;
// https://developer.chrome.com/extensions/messaging
chrome.runtime.sendMessage({
 seccode: '40cff5d7f76e4a7f4eadff67796ceda0',
 max_vid: '187318',
 VID: '187261'
}, function(response) {
	console.log(response);
});
var flashParams = document.getElementsByClassName('videoplayer')[0].getElementsByTagName('embed')[0].attributes.flashvars;
console.log(flashParams.textContent);
console.log(flashParams.textContent.match(regex));

console.log('content script init');

