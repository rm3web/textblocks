var async = require('async');
var markdown = require('markdown');

var turnTextIntoPara = function (input) {
	var encodedsrc = input.replace('&', '&amp;').replace('<', '&lt;')
			.replace('>', '&gt;').replace('"', '&quot;');
	return '<p>' + encodedsrc.replace('\n\n', '</p>\n<p>') + '</p>';
};

var formats = {};

var inputFormats = {
	plainishtext: function (input, callback) {
		callback(null, {source: input, format: 'plainishtext'});
	},
	markdown: function (input, callback) {
		var output = markdown.markdown.toHTML(input);
		callback(null, {source: input, htmltext: output, format: 'markdown'});
	},
	atxplaintext: function (input, callback) {
		var re = new RegExp('^(\#{1,6}[ \t]*.+?[ \t]*\#*\n+)', 'm');
		var parts =	input.split(re), blox = [];
		parts.forEach(function (element, index, array) {
			if (element !== '') {
				if (element.charAt(0) === '#') {
					blox.push({h: element, p: []});
				} else {
					blox[blox.length - 1].p.push(element);
				}
			}
		});
		var outblox = [];
		blox.forEach(function (element, index, array) {
			var reh = new RegExp('^(\#{1,6})[ \t]*(.+)\#*');
			var found = element.h.match(reh);
			if (found) {
				var level = found[1].length, txt = found[2];
				var encodedsrc = '<h' + level + '>' + txt + '</h' + level + '>';
				encodedsrc = encodedsrc + turnTextIntoPara(element.p.join(''));
				outblox.push({source : encodedsrc, format: 'html'});
			}
		});
		callback(null, {format: 'section', blocks: outblox});
	}
};


var makeTextBlock = function (source, format, callback) {
	if (inputFormats.hasOwnProperty(format)) {
		inputFormats[format](source, callback);
	} else {
		callback(new Error('no valid format'));
	}
};

var makeTextBlockSection = function (blocks, callback) {
	var blockarr = blocks;
	if (!(blockarr instanceof Array)) {
		blockarr = [blockarr];
	}
	callback(null, {format: 'section', blocks: blockarr});
};

var outputTextBlock = function (block, callback) {
	if (block.hasOwnProperty('htmltext')) {
		callback(null, block.htmltext);
	} else {
		if (formats.hasOwnProperty(block.format)) {
			formats[block.format](block, callback);
		} else {
			callback(new Error('unknown format: ' + block.format));
		}
	}
};

formats = {
	plainishtext: function (input, callback) {
		callback(null, turnTextIntoPara(input.source));
	},
	html: function (input, callback) {
		callback(null, input.source);
	},
	section: function (input, callback) {
		async.reduce(input.blocks, '',
			function (memo, item, callback) {
				outputTextBlock(item, function (err, val) {
					callback(null, memo + val);
				});
			},
			callback);
	}
};


exports.makeTextBlock = makeTextBlock;
exports.outputTextBlock = outputTextBlock;
exports.makeTextBlockSection = makeTextBlockSection;
exports.formatsList = Object.keys(inputFormats);
