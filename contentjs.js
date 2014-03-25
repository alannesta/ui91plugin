(function($){
	// $('.threadbit new').css('color','red');
	$('.threadinfo').css('background-color','red');

	var id = window.localStorage.length;

	// window.localStorage.setItem('1','markelov')
	console.log(window.localStorage.length);

	for (var i = 0; i < window.localStorage.length; i++){
		console.log('key: '+localStorage.key(i)+' value: '+window.localStorage.getItem(localStorage.key(i)));
	}

	$('.threadinfo').on('click', function(){
		console.log('on click triggered')
		//window.localStorage.setItem((id+1).toString(), 'url clicked');
		
	});


})(jQuery);

console.log('content script loaded');