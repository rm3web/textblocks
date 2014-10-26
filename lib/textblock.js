var async = require('async');
var markdown = require('markdown');

/**
* @overview These are operations for slinging structured text.
* @title Textblocks
* @module textblock
*/


/**
 * Formats list
 * @constant
 */
var formats;

/**
 * Input formats
 * @constant
 */
var inputFormats;

/**
 * Silly formatter: Sanatize plain text and turn it into paragraps
 * @param {String} input input text
 * @return {String} Text that has been encoded 
 */
var turnTextIntoPara = function (input) {
	var encodedsrc = input.replace('&', '&amp;').replace('<', '&lt;')
			.replace('>', '&gt;').replace('"', '&quot;');
	return '<p>' + encodedsrc.replace('\n\n', '</p>\n<p>') + '</p>';
};

inputFormats = {
	html: function(input, callback) {
		callback(null, {htmltext: input, format: 'html'});
	},
	plainishtext: function (input, callback) {
		callback(null, {source: input, format: 'plainishtext'});
	},
	markdown: function (input, callback) {
		var output = markdown.markdown.toHTML(input);
		callback(null, {source: input, htmltext: output, format: 'markdown'});
	},
	atxplaintext: function (input, callback) {
		var re = new RegExp('^(#{1,6}[ \t]*.+?[ \t]*#*\n+)', 'm');
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
			var reh = new RegExp('^(#{1,6})[ \t]*(.+)#*');
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

/**
 * Make a text block from source
 * @param {String} source The source to make a text block from
 * @param {String} format The format to use
 * @param {Function} callback A callback called with (err, block)
 */
var makeTextBlock = function (source, format, callback) {
	if (inputFormats.hasOwnProperty(format)) {
		inputFormats[format](source, callback);
	} else {
		callback(new Error('no valid format'));
	}
};

/**
 * Convert one or more blocks into a section
 * @param {Object} blocks A block or an array of blocks
 * @param {Function} callback A callback called with (err, newblock)
 */
var makeTextBlockSection = function (blocks, callback) {
	var blockarr = blocks;
	if (!(blockarr instanceof Array)) {
		blockarr = [blockarr];
	}
	callback(null, {format: 'section', blocks: blockarr});
};

/**
 * Output a text block in HTML
 * @param {Object} block The text block to be output
 * @param {Function} callback A callback called with (err, text)
 */
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
