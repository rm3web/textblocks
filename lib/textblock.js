var async = require('async');
var md = require('markdown-it')({
  html:         true,         // Enable HTML tags in source
  xhtmlOut:     true,         // Use '/' to close single tags (<br />)
  breaks:       false,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks
  linkify:      false,        // autoconvert URL-like texts to links

  typographer:  false,

  quotes: '\u201c\u201d\u2018\u2019',

  highlight: null,

  maxNesting:   20
});

var markdownItAttrs = require('markdown-it-attrs');
md.use(markdownItAttrs);

var xssFilters = require('xss-filters');
var cheerio = require('cheerio');
var url = require('url');

var striptags = require('striptags');

var createDOMPurify = require('dompurify');
var jsdom = require('jsdom');
var window = jsdom.jsdom('', {
  features: {
    FetchExternalResources: false, // disables resource loading over HTTP / filesystem
    ProcessExternalResources: false // do not execute JS within script blocks
  }
}).defaultView;
var DOMPurify = createDOMPurify(window);

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
 * Text Enhancment Blockers
 * @constant
 */
var enhancementBlockers = [];

/**
 * Text Enhancment Resolvers
 * @constant
 */
var enhancementResolvers = {};

/**
 * Silly formatter: Sanatize plain text and turn it into paragraps
 * @param {String} input input text
 * @return {String} Text that has been encoded
 */
var turnTextIntoPara = function(input) {
  var encodedsrc = xssFilters.inHTMLData(input);
  return '<p>' + encodedsrc.replace('\n\n', '</p>\n<p>') + '</p>';
};

/**
 * Silly formatter: Generate a textual placeholder for text enhancement
 * @param {Object} $ Cheerio instance
 * @param {String} enhancementName The name to find the enhancement with later
 * @param {ObjecT} data The data to be serialized
 * @return {String} Text that has been encoded
 */
function generatePlaceholder($, enhancementName, data) {
  data.name = enhancementName;
  var attrs = JSON.stringify(data);
  var placeholder = $('<!-- TEXTBLOCK --><code>' + encodeURI(attrs) +
        '</code><!-- TEXTBLOCK -->');
  return placeholder;
}

/**
 * Split into slabs, undoing the placeholders created in generatePlaceholder
 * @param {String} str The string to convert back to slabs
 * @return {Array} Slabs that have been broken out
 */
function splitIntoSlabs(str) {
  var slabs = str.split('<!-- TEXTBLOCK -->');
  return slabs.map(function(val, index, array) {
    if (index % 2 == 1) {
      var rawAttr = val.match(/<code>(.*)<\/code>/);
      var attrs = JSON.parse(decodeURI(rawAttr[1]));
      return attrs;
    } else {
      return val;
    }
  });
}

function enrichHtmlSlabs(rawString) {
  var $ = cheerio.load(rawString);
  var changed = false;

  enhancementBlockers.forEach(function(val, index, array) {
    changed = true;
    val($, generatePlaceholder);
  });
  var slabs = splitIntoSlabs($.html());
  if (changed) {
    return slabs;
  } else {
    return [rawString];
  }
}

validateFormats = {
  html: function(block) {
    if (block.hasOwnProperty('source')) {
      var output = DOMPurify.sanitize(block.source);
      return {source: output, format: 'html', htmlslabs: enrichHtmlSlabs(output)};
    }
    throw new Error('html block has neither source nor htmltext');
  },
  markdown: function(block) {
    if (block.hasOwnProperty('source')) {
      var output = md.render(block.source);
      return {source: block.source, htmlslabs: enrichHtmlSlabs(output), format: 'markdown'};
    }
    throw new Error('markdown block has no source');
  },
  plainishtext: function(block) {
    if (block.hasOwnProperty('source')) {
      var output = turnTextIntoPara(block.source);
      return {source: block.source, htmlslabs: enrichHtmlSlabs(output), format: 'plainishtext'};
    }
    throw new Error('plainishtext block has no source');
  },
  section: function(block) {
    var validBlocks = block.blocks.map(function(val) {
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
    var output = DOMPurify.sanitize(input);
    return {source: output, htmlslabs: enrichHtmlSlabs(output), format: 'html'};
  },
  plainishtext: function(input) {
    var output = turnTextIntoPara(input);
    return {source: input, htmlslabs: enrichHtmlSlabs(output), format: 'plainishtext'};
  },
  markdown: function(input) {
    var output = md.render(input);
    return {source: input, htmlslabs: enrichHtmlSlabs(output), format: 'markdown'};
  }
};

/**
 * Make a text block from source
 * @param {String} source The source to make a text block from
 * @param {String} format The format to use
 * @return {Object} a new textblock
 */
var makeTextBlock = function(source, format) {
  if (inputFormats.hasOwnProperty(format)) {
    return inputFormats[format](source);
  } else {
    throw new Error('invalid format to make a text block from: ' + source.format);
  }
};

/**
 * Validate a text blocks
 * @param {String} source The source untrusted text block
 * @return {Object} a cleaned text block
 */
var validateTextBlock = function(source) {
  if (source.hasOwnProperty('format')) {
    if (validateFormats.hasOwnProperty(source.format)) {
      return validateFormats[source.format](source);
    } else {
      throw new Error('invalid format for textblock: ' + source.format);
    }
  }
  throw new Error('invalid format for textblock (did you pass an Object in?)');
};

/**
 * Convert one or more blocks into a section
 * @param {Object|Array} blocks A block or an array of blocks
 * @return {Object} A text block
 */
var makeTextBlockSection = function(blocks) {
  var blockarr = blocks;
  if (!(blockarr instanceof Array)) {
    blockarr = [blockarr];
  }
  return {format: 'section', blocks: blockarr};
};

var outputSlabs = function(slabs, ctx, callback) {
  async.reduce(slabs,'', function(memo, item, callback) {
    if (typeof item === "string") {
      callback(null, memo + item);
    } else {
      enhancementResolvers[item.name](item, ctx, function(err, output) {
        if (err) {
          return callback(err);
        } else {
          callback(err, memo + output);
        }
      });
    }
  }, callback);
};

var outputSlabsAsText = function(slabs, callback) {
  return striptags(slabs.reduce(function(previousValue, currentValue, currentIndex, array) {
    if (typeof currentValue === "string") {
      return previousValue + currentValue;
    } else {
      return previousValue;
    }
  }, ''));
};

/**
 * Output a text block in HTML.
 *
 * Warning: This assumes that you have used validateTextBlock or makeTextBlock
 * to ensure a valid XSS-free textblock.
 *
 * @param {Object} block The text block to be output
 * @param {String} pos The position to start adding suffixes to (useful for generating links or pagination)
 * @param {Object} ctx An object to be passed to all of the rendering functions
 * @param {Function} callback A callback called with (err, text)
 */
var outputTextBlock = function(block, pos, ctx, callback) {
  if (block.hasOwnProperty('htmlslabs')) {
    outputSlabs(block.htmlslabs, ctx, callback);
  } else {
    if (formats.hasOwnProperty(block.format)) {
      formats[block.format](block, pos, ctx, callback);
    } else {
      callback(new Error('unknown format: ' + block.format));
    }
  }
};

/**
 * Output a text block as plain-text
 *
 * @param {Object} block The text block to be output
 * @return {String} the textual content, sans enhancement and HTML
 */
var extractTextBlockText = function(block) {
  if (block.hasOwnProperty('htmlslabs')) {
    return outputSlabsAsText(block.htmlslabs);
  } else {
    if (block.format === 'section') {
      return block.blocks.reduce(function(previousValue, currentValue, currentIndex, array) {
        return previousValue + extractTextBlockText(currentValue);
      }, '');
    } else {
      return '';
    }
  }
};

formats = {
  section: function(input, pos, ctx, callback) {
    var tmp = input.blocks.map(function(block, index, array) {
      return {index: index, block: block};
    });
    async.reduce(tmp, '',
      function(memo, item, callback) {
        outputTextBlock(item.block, pos + "_" + item.index, ctx, function(err, val) {
          callback(null, memo + val);
        });
      }, callback);
  }
};

var registerTextBlockType = function(format, textBlockValidator, textBlockFormatter) {
  if (formats.hasOwnProperty(format)) {
    throw new Error('Format ' + format + ' already exists');
  }
  validateFormats[format] = textBlockValidator;
  formats[format] = textBlockFormatter;
};

var registerEnhancement = function(name, enhancementBlocker, enhancementResolver) {
  enhancementBlockers.push(enhancementBlocker);
  enhancementResolvers[name] = enhancementResolver;
};

exports.makeTextBlock = makeTextBlock;
exports.outputTextBlock = outputTextBlock;
exports.makeTextBlockSection = makeTextBlockSection;
exports.validateTextBlock = validateTextBlock;
exports.formatsList = Object.keys(inputFormats);
exports.registerTextBlockType = registerTextBlockType;
exports.registerEnhancement = registerEnhancement;
exports.extractTextBlockText = extractTextBlockText;
