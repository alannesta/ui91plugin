var url = '';

window.onload = function() {
	document.getElementById('download').addEventListener('click', function() {
		if (url.length > 0) {
			chrome.downloads.download({
				url: url,
				saveAs: true
			}, function (downloadId) {
				console.log('Download with: ' + downloadId);
			});
		} else {
			console.log('nothing to download');
		}
	});

	chrome.windows.getCurrent(function(currentWindow) {
		chrome.tabs.query({active: true, windowId: currentWindow.id},
			function(activeTabs) {
				chrome.tabs.executeScript(
					activeTabs[0].id, {file: 'contentjs.js', allFrames: true});
			});
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		// console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
		if (request.seccode) {
			//make network request
			var queryUrl = 'http://email.91dizhi.at.gmail.com.8h5.space/getfile.php?VID=' + request.VID + '&mp4=0&seccode=' + request.seccode + '&max_vid=' + request.max_vid;
			requestPage(queryUrl);
			sendResponse('Roger that');
		} else {
			alert('Could not parse params from page');
		}
	});
};

function requestPage(url) {
	var xhr = new XMLHttpRequest();

	xhr.open("url", false);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			// WARNING! Might be evaluating an evil script!
			// console.log(result);
			url = xhr.responseText;
			// update the url in popup.html
			document.getElementById('url').innerHTML = url;
		}
	}
}
