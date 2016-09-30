var csv = require('fast-csv'),
	_ = require('lodash'),
	fs = require('fs'),
	path = require('path');

var path_arg = process.argv[2];
console.log('Going to read path: ' + path_arg);

var json_data = [];

var options = { headers: true};
csv.fromPath(path_arg, options).
	on('data', function(data){
		var json = {};
		_.forIn(data, function(value, key){
			json[key]= value;
		});
		json_data.push(json);	
	}).
	on('end', function(){
		console.log('Finished reading file.');
		var fileName = path.basename(path_arg, '.csv');
		writeJson(fileName, json_data);
	}).
	on('error', function(error){
		console.log(error);
	});

var writeJson = function(fileName, data){
	var file = fileName + '.json';
	console.log('Going to write data to file: ' + file);
	var prettyJson = JSON.stringify(data, null, 2);
	fs.writeFile(file, prettyJson, (err) => { if(err) console.log(err);});
	console.log('Finished writing to file.');
};
