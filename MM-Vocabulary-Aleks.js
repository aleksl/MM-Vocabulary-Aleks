/* global Module */

/* Magic Mirror
 * Module: MM-DHT-Alex
 *
 * By Dominic Marx
 * MIT Licensed.
 */

Module.register('MM-Vocabulary-Aleks', {
	defaults: {
		fileName: 'dictionary.json',
		maximumEntries : 10,
		clearSavedWords : false,
		dictionary: [
			{
			  "ang": "example1a",
			  "pl": "example1b"
			},{
			  "ang": "example2a",
			  "pl": "example2b"
			},{
			  "ang": "example3a",
			  "pl": "example3b"
			}
		]
	},
	
	COOKIE_NAME_WIN : "MM-Vocabulary-Aleks-winNumbers",
	COOKIE_NAME_WIN_TOTAL : "MM-Vocabulary-Aleks-winNumbersTotal",
	
	// Define required scripts.
	getScripts: function() {
		return [];
	},
	
	// Define required styles.
	getStyles: function () {
		return [];
	},

	/*
	 * Dont know why this.hide() is not working :(
	 * As workaround I decided to return empty elements/strings in getDom() & getHeader().
	 * => But there is the heading underline....
	 */
	start: function() {
		Log.info('Starting module: ' + this.name);
		
		if(this.config.clearSavedWords){
			var d = new Date();
			d.setDate(d.getDate()-2);
			this.setCookie(this.COOKIE_NAME_WIN, [], d);
			d.setFullYear(d.getFullYear() + 10);
			this.setCookie(this.COOKIE_NAME_WIN_TOTAL, [], d);
		}
		
		
		this.getVocabularyList();
		var self = this;
		/*
		setInterval(function(){
			self.getVocabularyList();
		},30000);
		*/
		
	},
	
	getCookie: function(cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		},
		
	setCookie: function(cname, value, time) {
		var expires = "expires="+ time.toUTCString();
		document.cookie = cname + "=" + value + ";" + expires + ";path=/";	
	},

	getVocabularyList: function(){
		var winNumbers = null;
		var cookie = this.getCookie(this.COOKIE_NAME_WIN);
		if(cookie != null && cookie != ""){
			winNumbers = cookie.split(",");
		}

		if(winNumbers != null && winNumbers.length > 0){
			this.sendSocketNotification("VOCABULARY_GET_BY_INDEX", { "fileName" : this.config.fileName, "indexs" : winNumbers});			
		} else {
			this.sendSocketNotification("VOCABULARY_GET_LENGTH", this.config.fileName);
		}
	},
		

	getDom: function() {
		var table = document.createElement("table");
		table.className = "small";

		for(var i in this.config.dictionary){
			var obj = this.config.dictionary[i];

			var row = document.createElement("tr");
			table.appendChild(row);
			var lang1Cell = document.createElement("td");
			lang1Cell.className = "word";
			lang1Cell.innerHTML = obj.ang;
			row.appendChild(lang1Cell);	
			
			var lang2Cell = document.createElement("td");
			lang2Cell.className = "trans";
			lang2Cell.innerHTML = obj.pl;
			row.appendChild(lang2Cell);
		}

		return table;
	},
	
	getRandomNumberList: function(maxLength) {
		function getRandomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		
		var winNumbers = [];
		var winNumbersTotal = [];
		var cookieWinTotal = this.getCookie(this.COOKIE_NAME_WIN_TOTAL);
		if(cookieWinTotal != null && cookieWinTotal != ""){
			winNumbersTotal = cookieWinTotal.split(",");
		}
		
		if(winNumbersTotal != null && (winNumbersTotal.length+this.config.maximumEntries) >= maxLength){
			winNumbersTotal = [];
		}
		
		
		if(maxLength < this.config.maximumEntries){
			for(var i=0;i< maxLength; i++){
				winNumbers.push(i);
			}
			return winNumbers;
		}
		
		function collectNumbers(){
			var winNum = getRandomInt(0 , maxLength-1);
			if(winNumbers.indexOf(winNum) == -1 && winNumbersTotal.indexOf(winNum) == -1){
				winNumbers.push(winNum);
			} else {
				collectNumbers();
			}
		}
		
		for(var i=0;i< this.config.maximumEntries; i++){
			collectNumbers();
		}
		
		var cookieWin = this.getCookie(this.COOKIE_NAME_WIN);
		if(cookieWin != null && cookieWin != ""){
			winNumbersTotal = cookieWin.split(",");
		}
		
		winNumbersTotal = winNumbersTotal.concat(winNumbers);
		
		var d = new Date();
		d.setFullYear(d.getFullYear() + 10);
		this.setCookie(this.COOKIE_NAME_WIN_TOTAL, winNumbersTotal, d);
		
		
		return winNumbers;
	},
	
	
	socketNotificationReceived: function(notification, payload) {
		if( notification === 'VOCABULARY_GET_LENGTH' ){
			//Random maximumEntries from size
			if(payload != null && !isNaN(payload)){
				var winNumbers = this.getRandomNumberList(payload);
				var d = new Date();
				d.setHours(23);
				d.setMinutes(59);
				this.setCookie(this.COOKIE_NAME_WIN, winNumbers, d);
				this.sendSocketNotification("VOCABULARY_GET_BY_INDEX", { "fileName" : this.config.fileName, "indexs" : winNumbers});	
			}
		}
		if( notification === 'VOCABULARY_LIST' ){
			//console.log(payload);
			if(payload != null && payload.length > 0){
				this.config.dictionary = payload;				
			}
			this.updateDom();			
		}
	}
});