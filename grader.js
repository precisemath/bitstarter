#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

+ cheerio
	- https://github.com/MatthewMueller/cheerio
	- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
	- http://maxogden.com/scraping-with-node.html

+ commander.js
	- https://github.com/visionmedia/commander.js
	- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ JSON
	- http://en.wikipedia.org/wiki/JSON
	- https://developer.mozilla.org/en-US/docs/JSON
	- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs      = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest    = require('restler');
var sys     = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var TEMP_FILE = "./temp.tmp";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
};

var assertURLExists = function(url) {
  return url; 
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioURLData = function(urlData) {
    return cheerio.load(urlData);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(urlData, checksfile) {
    $ = cheerioURLData(urlData);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists) )
        .option('-u, --url  <URL>', 'Any URL', clone(assertURLExists) )
        .parse(process.argv);

    //Check for the parameters
    if (!program.file && !program.url) {
       console.log("Need to use either parameter --file or --url. Exiting.");
       process.exit(1); 
    }

    if (program.file && program.url) {
       console.log("Use either --file or --url, Not both. Exiting.");
       process.exit(1); 
    }

    var checkJson;
    console.log ("%s",program.url);

    if (program.file) {
       checkJson = checkHtmlFile(program.file, program.checks);
    }
    else {
      rest.get(program.url).on('complete', function(result,response) {
         if (result instanceof Error) {
            console.log("%s does not exist.Exiting.",url);
            process.exit(1);
         }
         fs.writeFileSync(TEMP_FILE, result);
         return response;
      });
       checkJson = checkHtmlFile(TEMP_FILE, program.checks);
    }
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkcheckURL = checkURL;
}
