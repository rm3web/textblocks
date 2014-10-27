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
	html: function(input) {
		return {htmltext: input, format: 'html'};
	},
	plainishtext: function (input) {
		return {source: input, format: 'plainishtext'};
	},
	markdown: function (input) {
		var output = markdown.markdown.toHTML(input);
		return {source: input, htmltext: output, format: 'markdown'};
	},
	atxplaintext: function (input) {
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
				outblox.push({htmltext : encodedsrc, format: 'html'});
			}
		});
		return {format: 'section', blocks: outblox};
	}
};

/**
 * Make a text block from source
 * @param {String} source The source to make a text block from
 * @param {String} format The format to use
 * @param {Function} callback A callback called with (err, block)
 */
var makeTextBlock = function (source, format) {
	if (inputFormats.hasOwnProperty(format)) {
		return inputFormats[format](source);
	} else {
		throw new Error('no valid format');
	}
};

/**
 * Convert one or more blocks into a section
 * @param {Object} blocks A block or an array of blocks
 * @param {Function} callback A callback called with (err, newblock)
 */
var makeTextBlockSection = function (blocks) {
	var blockarr = blocks;
	if (!(blockarr instanceof Array)) {
		blockarr = [blockarr];
	}
	return {format: 'section', blocks: blockarr};
};

/**
 * Output a text block in HTML
 * @param {Object} block The text block to be output
 */
var outputTextBlock = function (block) {
	if (block.hasOwnProperty('htmltext')) {
		return block.htmltext;
	} else {
		if (formats.hasOwnProperty(block.format)) {
			return formats[block.format](block);
		} else {
			throw new Error('unknown format: ' + block.format);
		}
	}
};

formats = {
	plainishtext: function (input) {
		return turnTextIntoPara(input.source);
	},
	html: function (input) {
		return input.htmltext;
	},
	section: function (input) {
		return input.blocks.reduce(function(previousValue, currentValue, index, array) {
			return '' + previousValue + outputTextBlock(currentValue);
		},'');
	}
};


exports.makeTextBlock = makeTextBlock;
exports.outputTextBlock = outputTextBlock;
exports.makeTextBlockSection = makeTextBlockSection;
exports.formatsList = Object.keys(inputFormats);
