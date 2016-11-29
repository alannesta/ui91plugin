console.log('backgroud script init');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action && request.action === 'upload') {
		console.log(request.action);
		xhrReadBlob(request.videoUrl, request.videoTitle);
	}
});

function xhrReadBlob(url, videoTitle) {
	var oReq = new XMLHttpRequest();
	oReq.open("GET", url, true);
	oReq.responseType = "blob";

	oReq.onload = function(oEvent) {
		console.log('finish stream, start upload to dropbox');
		showNotification('Upload', 'finish download, start upload to dropbox');

		xhrUpload(oReq.response, videoTitle);
	};

	oReq.addEventListener("progress", updateProgress);

	oReq.send();
}

function xhrUpload(blob, videoTitle) {
	var access_token = 'XMoE6qP_C28AAAAAAAABr8Zn33ySn2ND5EYLkBMC16R_lqX_nJ5nlYoMfs80yjsc';

	var url = "https://content.dropboxapi.com/1/files_put/auto/"+ videoTitle + ".mp4";

	var oReq = new XMLHttpRequest();
	oReq.open("POST", url, true);

	oReq.setRequestHeader('Authorization', 'Bearer ' + access_token);
	// oReq.setRequestHeader('Content-Type', 'application/octet-stream')
	// oReq.setRequestHeader('Content-Length', blob.size);

	oReq.addEventListener("progress", updateProgress);

	oReq.onload = function (oEvent) {
		// Uploaded.
		console.log('upload successful');
		showNotification('Upload Finished', 'Successfully uploaded to dropbox');

	};
	oReq.send(blob);
}

function updateProgress(oEvent) {
	if (oEvent.lengthComputable) {
		var percentComplete = oEvent.loaded / oEvent.total;
		console.log(percentComplete);
	} else {
		console.log('cannot show progress');
	}
}


function showNotification(title, msg) {
	chrome.notifications.create({
		type: 'basic',
		title: title,
		message: msg,
		iconUrl: './assets/sdd.jpg'
	});
}