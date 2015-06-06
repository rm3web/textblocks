var textblock = require('../lib/textblock');
var should = require('chai').should();

describe('text_block', function() {
	/**
	 * Test that we can input 'atxplaintext' and that it turns four sections
	 * into individual text blocks
	 */
	it('should make atxplaintext', function () {
		var input = '# head\n\nblah\nblah bla#h\n# head2\n\nblah2\n# head3\n## head4';
		var block = textblock.makeTextBlock(input,'atxplaintext');
		block.format.should.equal('section');
		block.blocks.length.should.equal(4);
		block.blocks.forEach(function(element) {
			element.format.should.equal('html');
		});
		var str = textblock.outputTextBlock(block);
		str.should.equal('<h1>head</h1><p>blah\nblah bla#h\n</p><h1>head2</h1><p>blah2\n</p><h1>head3</h1><p></p><h2>head4</h2><p></p>');
	});


	/**
	 * Test that we can input markdown and that it stores the source 
	 * and also that it formats it properly
	 */
	it('should make markdown', function () {
		var input = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
		var block = textblock.makeTextBlock(input,'markdown');
		block.format.should.equal('markdown');
		block.should.have.property('source');
		block.should.have.property('htmltext');
		var str = textblock.outputTextBlock(block);
		str.should.equal('<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>');
	});

	/*
	 * Ensures that we accept 'plainishtext' and that it gets encoded
	 * as HTML properly
	 */ 
	it('should make plainishtext', function () {
		var block = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
		var str = textblock.outputTextBlock(block);
		str.should.equal("<p>&amp;blah</p>\n<p>blah</p>");
	});

	/*
	 * Ensures that html is a passthrough
	 */ 
	it('should make html', function () {
		var block = textblock.makeTextBlock('<div>Test</div>','html');
		var str = textblock.outputTextBlock(block);
		str.should.equal("<div>Test</div>");
	});

	/*
	 * Tests that we can make a text block and then make sections out of it.
	 */
	it('should make sections', function () {
		var block = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
		var blocks = textblock.makeTextBlockSection(block);
		var str = textblock.outputTextBlock(block);
		str.should.equal("<p>&amp;blah</p>\n<p>blah</p>");
	});

	/*
	 * Tests that unicode hilarity is preserved.
	 */
	it('should preserve zalgo unicode hilarity', function() {

		// Zalgo haunts the internet seeking evil, danger, and people who parse XHTML with 
		// regexes.
		var zalgo = "\u005A\u0340\u035A\u0318\u0061\u035C\u0329\u0318\u0339\u0320\u006C\u035E\u0332\u0067\u0315\u0324\u0348\u033C\u0324\u031E\u006F\u0338\u0349\u0325";
		// A former coworker of mine accidentally broke a bunch of stuff with the script A.
		var awesome = "\uD835\uDC9C\u0077\u0065\u0073\u006F\u006D\u0065";
		
		var block = textblock.makeTextBlock('<div>'+ zalgo + awesome + '</div>','html');
		var str = textblock.outputTextBlock(block);
		str.should.equal('<div>'+ zalgo + awesome + '</div>');

		block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'plainishtext');
		str = textblock.outputTextBlock(block);
		str.should.equal("<p>" + zalgo + "</p>\n<p>" + awesome + "</p>");

		block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'markdown');
		str = textblock.outputTextBlock(block);
		str.should.equal("<p>" + zalgo + "</p>\n\n<p>" + awesome + "</p>");
	});
});