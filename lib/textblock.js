var async = require('async');
var markdown = require('markdown');
var xssFilters = require('xss-filters');
var sanitize = require('sanitize-caja');

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
 * Format validations
 * @constant
 */
var validateFormats;

/**
 * Silly formatter: Sanatize plain text and turn it into paragraps
 * @param {String} input input text
 * @return {String} Text that has been encoded 
 */
var turnTextIntoPara = function (input) {
	var encodedsrc = xssFilters.inHTMLData(input);
	return '<p>' + encodedsrc.replace('\n\n', '</p>\n<p>') + '</p>';
};

validateFormats = {
	pragma: function(block) {
		return block;
	},
	html: function(block) {
		if (block.hasOwnProperty('source')) {
			return {htmltext: sanitize(block.source), format: 'html'};
		} else if (block.hasOwnProperty('htmltext')) {
			return {htmltext: sanitize(block.htmltext), format: 'html'};
		}
		throw new Error('html block has neither source nor htmltext');
	},
	markdown: function(block) {
		if (block.hasOwnProperty('source')) {
			var output = markdown.markdown.toHTML(block.source);
			return {source: block.source, htmltext: output, format: 'markdown'};
		}
		throw new Error('markdown block has no source');
	},
	plainishtext: function(block) {
		if (block.hasOwnProperty('source')) {
			return {source: block.source, format: 'plainishtext'};
		}
		throw new Error('plainishtext block has no source');
	},
	section: function(block) {
		var validBlocks = block.blocks.map(function (val) {
			if (validateFormats.hasOwnProperty(val.format)) {
				return validateFormats[val.format](val);
			}  else {
				throw new Error('validating textblock with invalid block type');
			}
		});
		return {blocks: validBlocks, format: 'section'};
	}
};

inputFormats = {
	html: function(input) {
		return {htmltext: sanitize(input), format: 'html'};
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
 * @returns {Object} a new textblock
 */
var makeTextBlock = function (source, format) {
	if (inputFormats.hasOwnProperty(format)) {
		return inputFormats[format](source);
	} else {
		throw new Error('invalid format to make a text block from: ' + source.format);
	}
};

/**
 * Validate a text blocks
 * @param {String} source The source untrusted text block
 * @param {Function} pragmafunc [optional] A function to check the pragma blocks
 * @returns {Object} a cleaned text block
 */
var validateTextBlock = function (source, pragmafunc) {
	if (source.hasOwnProperty('format')) {
		if (validateFormats.hasOwnProperty(source.format)) {
			if (pragmafunc && source.format === 'pragma') {
				return pragmafunc(source);
			}
			return validateFormats[source.format](source);
		} else {
			throw new Error('invalid format for textblock: ' + source.format);
		}
	}
	throw new Error('invalid format for textblock (did you pass an Object in?)');
};

/**
 * Resolve any pragma blocks
 * @param {String} source The source text blocks, potentially containing pragmas
 * @param {Function} pragmafunc A function called with (block, next) 
 * @param {Function} next A function called with (err, block) where block has been resolved
 */
var resolvePragmaBlocks = function(source, pragmafunc, next) {
	if (source.format === 'pragma') {
		return pragmafunc(source, next);
	} else if (source.format === 'section') {
		async.map(source.blocks, function(item, next) {
			resolvePragmaBlocks(item, pragmafunc, next);
		}, function(err, results) {
			if (err) {
				return next(err);
			}
			next(err, {format: 'section', blocks: results});
		});
	} else {
		async.setImmediate(function(){
    	next(null, source);
		});
	}
};

/**
 * Convert one or more blocks into a section
 * @param {Object|Array} blocks A block or an array of blocks
 * @returns {Object} A text block
 */
var makeTextBlockSection = function (blocks) {
	var blockarr = blocks;
	if (!(blockarr instanceof Array)) {
		blockarr = [blockarr];
	}
	return {format: 'section', blocks: blockarr};
};

/**
 * Output a text block in HTML.
 * 
 * Warning: This assumes that you have used validateTextBlock or makeTextBlock 
 * to ensure a valid XSS-free textblock.
 *
 * @param {Object} block The text block to be output
 * @returns {String} the formatted block
 */
var outputTextBlock = function (block) {
	if (block.hasOwnProperty('htmltext')) {
		return block.htmltext;
	} else {
		if (formats.hasOwnProperty(block.format)) {
			return formats[block.format](block);
		} else {
			throw new Error('invalid format to output: ' + block.format);
		}
	}
};

formats = {
	plainishtext: function (input) {
		return turnTextIntoPara(input.source);
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
exports.validateTextBlock = validateTextBlock;
exports.formatsList = Object.keys(inputFormats);
exports.resolvePragmaBlocks = resolvePragmaBlocks;