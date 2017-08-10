/* Magic Mirror
 * Module: mrx-work-traffic
 *
 * By Dominic Marx
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var dictionaryFile = require('./dictionary.json');
var fs = require('fs');
 
 module.exports = NodeHelper.create({
    // subclass start method.
    start: function() {
        console.log("====================== Starting node_helper for module [" + this.name + "]");
    },
	
	
	// subclass socketNotificationReceived
    socketNotificationReceived: function(notification, payload){
        if (notification === 'VOCABULARY_GET_LENGTH') {
			this.getVocabularyListLengthFromFile( payload );
        }
		
		if (notification === 'VOCABULARY_GET') {
			this.getVocabularyListFromFile( payload );
        }
		
		if (notification === 'VOCABULARY_GET_BY_INDEX') {
			this.getVocabularyListByIndexFromFile( payload );
        }
    },
	
	getVocabularyListFromFile: function( fileName ) {
		var _self = this;
		fs.readFile(require('path').resolve(__dirname,  fileName), 'utf8', (err, data) => {
		  if (err) throw err;
		  var vocabularyList = JSON.parse(data);
		  if(vocabularyList != null && vocabularyList.length > 0){
		  	_self.sendSocketNotification('VOCABULARY_LIST', vocabularyList);
		  }
		});  
	},
	
	getVocabularyListByIndexFromFile: function( payload ) {
		var _self = this;
		if(payload == null || payload.fileName == null || payload.indexs == null){
			return;
		}
		fs.readFile(require('path').resolve(__dirname,  payload.fileName), 'utf8', (err, data) => {
		  if (err) throw err;
		  var vocabularyList = JSON.parse(data);
		  if(vocabularyList != null && vocabularyList.length > 0){
			  var payloadList = [];
			  for(var i  in payload.indexs){
				  payloadList.push(vocabularyList[payload.indexs[i]]);
			  }
			  _self.sendSocketNotification('VOCABULARY_LIST', payloadList);
		  }
		});  
	},
	
	getVocabularyListLengthFromFile: function( fileName ) {
		var _self = this;
		fs.readFile(require('path').resolve(__dirname,  fileName), 'utf8', (err, data) => {
		  if (err) throw err;
		  var vocabularyList = JSON.parse(data);
		  if(vocabularyList != null && vocabularyList.length > 0){
		  	_self.sendSocketNotification('VOCABULARY_GET_LENGTH', vocabularyList.length);
		  }
		});  
	}
	
 });