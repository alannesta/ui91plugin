var videoUrl = '';

window.onload = function() {
	document.getElementById('download').addEventListener('click', function() {
		if (videoUrl.length > 0) {
			console.log('start download: ' + videoUrl);
			chrome.downloads.download({
				url: videoUrl,
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
					activeTabs[0].id, {file: 'contentjs.js'});
			});
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		// console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
		if (request.seccode) {
			//make network request
			var queryUrl = 'http://www.91porn.com/getfile.php?VID=' + request.VID + '&mp4=0&seccode=' + request.seccode + '&max_vid=' + request.max_vid;
			requestPage(queryUrl);
			sendResponse('Roger that');
		} else {
			alert('Could not parse params from page');
		}
	});
};

function requestPage(url) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.send();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			console.log('request success');

			//console.log(xhr.responseText);
			var stripped = decodeURIComponent(xhr.responseText).split('file=')[1];

			videoUrl = parseFileUrl(stripped);
			// update the url in popup.html
			document.getElementById('url').innerHTML = videoUrl;
		}
	}
}

function parseFileUrl(url) {
	var regex = /\/\/dl\/\//;
	if (regex.test(url) && url.indexOf('&domainUrl') > -1) {
		var result = url.replace(regex, '/dl/');
		return result.slice(0, result.indexOf('&domainUrl'));
	} else {
		return url;
	}
}
