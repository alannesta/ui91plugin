var videoUrl = '';
var clientMessage = null; // message from client
/*
 Bootstrapping plugin:
 1. bind download event listener
 2. inject/execute content script in current tab
 3. retrieve download history
 4. setup message handler
 */

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

	document.getElementById('clear').addEventListener('click', function() {
		chrome.storage.sync.clear();
	});

	// programmatically inject content script
	chrome.windows.getCurrent(function(currentWindow) {
		chrome.tabs.query({active: true, windowId: currentWindow.id},
			function(activeTabs) {
				chrome.tabs.executeScript(
					activeTabs[0].id, {file: 'contentjs.js'});
			});
	});

	// retrieve download history
	// TODO: only show recent downloads
	chrome.storage.sync.get(function(historyDownloads) {
		console.log(historyDownloads);
		var innerHTML = '';
		Object.keys(historyDownloads).forEach(function(key) {
			innerHTML += '<div><span class="videoName">' + key + '</span><span class="date"> --- '+ historyDownloads[key] +'</span></div>'
		});
		document.getElementById('recent-downloads').innerHTML = innerHTML;
	});

	// message handler
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		clientMessage = request;
		// console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
		if (request.flashParams.seccode) {
			//make network request to get the file url;
			var queryUrl = 'http://www.91porn.com/getfile.php?VID=' + request.flashParams.VID + '&mp4=0&seccode=' + request.flashParams.seccode + '&max_vid=' + request.flashParams.max_vid;
			requestPage(queryUrl);

			sendResponse('Roger that');
		} else {
			alert('Could not parse params from page');
		}
	});

	chrome.downloads.onCreated.addListener(function() {
		console.log('download start, save to history');
		var entry = {};
		entry[clientMessage.videoTitle] = new Date().toLocaleString();
		chrome.storage.sync.set(entry);
	})
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
