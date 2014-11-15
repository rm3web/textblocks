var textblock = require('../lib/textblock');
var test = require('tape');

/**
 * Test that we can input 'atxplaintext' and that it turns four sections
 * into individual text blocks
 */
test('text_block atxplaintext', function (t) {
	t.plan(3+4);
	var input = '# head\n\nblah\nblah bla#h\n# head2\n\nblah2\n# head3\n## head4';
	var block = textblock.makeTextBlock(input,'atxplaintext');
	t.deepEqual(block.format,'section');
	t.deepEqual(block.blocks.length,4);
	block.blocks.forEach(function(element) {
		t.deepEqual(element.format,'html');
	});
	var str = textblock.outputTextBlock(block);
	t.deepEqual(str, '<h1>head</h1><p>blah\nblah bla#h\n</p><h1>head2</h1><p>blah2\n</p><h1>head3</h1><p></p><h2>head4</h2><p></p>');
	t.end();
});


/**
 * Test that we can input markdown and that it stores the source 
 * and also that it formats it properly
 */
test('text_block markdown', function (t) {
	t.plan(4);
	var input = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
	var block = textblock.makeTextBlock(input,'markdown');
	t.deepEqual(block.format,'markdown');
	t.ok(block.hasOwnProperty('source'));
	t.ok(block.hasOwnProperty('htmltext'));
	var str = textblock.outputTextBlock(block);
	t.deepEqual(str, '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>');
	t.end();
});

/*
 * Ensures that we accept 'plainishtext' and that it gets encoded
 * as HTML properly
 */ 
test('text_block plainishtext', function (t) {
	t.plan(1);
	var block = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
	var str = textblock.outputTextBlock(block);
	t.deepEqual(str,"<p>&amp;blah</p>\n<p>blah</p>");
	t.end();
});

/*
 * Ensures that html is a passthrough
 */ 
test('text_block html', function (t) {
	t.plan(1);
	var block = textblock.makeTextBlock('<div>Test</div>','html');
	var str = textblock.outputTextBlock(block);
	t.deepEqual(str,"<div>Test</div>");
	t.end();
});

/*
 * Tests that we can make a text block and then make sections out of it.
 */
test('text_block section', function (t) {
	t.plan(1);
	var block = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
	var blocks = textblock.makeTextBlockSection(block);
	var str = textblock.outputTextBlock(block);
	t.deepEqual(str,"<p>&amp;blah</p>\n<p>blah</p>");
	t.end();
});

/*
 * Tests that unicode hilarity is preserved.
 */
test('text_block zalgo_is_awesome', function(t) {
	t.plan(3);

	// Zalgo haunts the internet seeking evil, danger, and people who parse XHTML with 
	// regexes.
	var zalgo = "\u005A\u0340\u035A\u0318\u0061\u035C\u0329\u0318\u0339\u0320\u006C\u035E\u0332\u0067\u0315\u0324\u0348\u033C\u0324\u031E\u006F\u0338\u0349\u0325";
	// A former coworker of mine accidentally broke a bunch of stuff with the script A.
	var awesome = "\uD835\uDC9C\u0077\u0065\u0073\u006F\u006D\u0065";
	
	var block = textblock.makeTextBlock('<div>'+ zalgo + awesome + '</div>','html');
	var str = textblock.outputTextBlock(block);
	t.deepEqual(str,'<div>'+ zalgo + awesome + '</div>');

	block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'plainishtext');
	str = textblock.outputTextBlock(block);
	t.deepEqual(str,"<p>" + zalgo + "</p>\n<p>" + awesome + "</p>");

	block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'markdown');
	str = textblock.outputTextBlock(block);
	t.deepEqual(str,"<p>" + zalgo + "</p>\n\n<p>" + awesome + "</p>");

	t.end();	
});