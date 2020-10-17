(function () {
	var test = function () {

		window.setInterval(function () {
	
			document.getElementsByClassName('ChatSend-txt')[0].focus()
		
	document.getElementsByClassName('ChatSend-txt')[0].value = '666666'
			
document.getElementsByClassName('ChatSend-button')[0].click()
		
},20500)

	}
	window.test = test
	test()
})()




