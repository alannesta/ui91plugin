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
			showMessage('nothing to download');
		}
	});

	document.getElementById('upload').addEventListener('click', function() {
		if (videoUrl.length > 0) {
			console.log('upload to dropbox: ' + videoUrl);
			showMessage('upload to dropbox: ' + videoUrl);

			// using background script to perform the job
			chrome.runtime.sendMessage({
				action: 'upload',
				videoUrl: videoUrl,
				videoTitle: clientMessage.videoTitle || 'video'+ Math.random().toFixed(3).split('.')[1]	// potential bug: click upload before url parsed
			}, function(response) {
				console.log(response);
			});
		} else {
			console.log('nothing to upload to dropbox');
			showMessage('nothing to upload to dropbox');

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
		var sortedHistory = sortHistory(historyDownloads);
		var innerHTML = '';
		var length = sortedHistory.length > 10? 10: sortedHistory.length;	// only show 10 entries
		for (var i = 0; i < length; i++) {
			innerHTML += '<div><span class="videoName">' + sortedHistory[i].name + '</span><span class="date"> --- '+ sortedHistory[i].date.toLocaleString() +'</span></div>'
		}
		// Object.keys(historyDownloads).forEach(function(key) {
		// 	innerHTML += '<div><span class="videoName">' + key + '</span><span class="date"> --- '+ historyDownloads[key] +'</span></div>'
		// });
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
			showMessage('Could not resolve flash params from content page');
		}
	});

	chrome.downloads.onCreated.addListener(function() {
		showMessage('Start downloading, adding to history');
		setTimeout(clearMessage, 6000);
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
			try {
				var stripped = decodeURIComponent(xhr.responseText).split('file=')[1];

				videoUrl = parseFileUrl(stripped);
				// update the url in popup.html
				document.getElementById('url').innerHTML = videoUrl;
			} catch(err) {
				showMessage('Could not resolve video urls with flash params');
			}

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

function sortHistory(historyObj) {
	var orderedArray = [];
	Object.keys(historyObj).forEach(function(key) {
		orderedArray.push({name: key, date: new Date(historyObj[key])});
	});
	return orderedArray.sort(function(a, b) {
		// the latest will be at the top of the ordered array;
		if (a.date > b.date) {
			return -1;
		}
		if (a.date === b.date) {
			return 0;
		}
		return 1;
	});
}

function showMessage(msg) {
	document.getElementById('message').innerText = msg;
}

function clearMessage() {
	document.getElementById('message').innerText = '';
}
