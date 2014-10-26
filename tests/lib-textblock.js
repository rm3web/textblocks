var textblock = require('../lib/textblock');
var test = require('tape');

/**
 * Test that we can input 'atxplaintext' and that it turns four sections
 * into individual text blocks
 */
test('text_block atxplaintext', function (t) {
	t.plan(4+4);
	var input = '# head\n\nblah\nblah bla#h\n# head2\n\nblah2\n# head3\n## head4';
	textblock.makeTextBlock(input,'atxplaintext', function (err, block) {
		t.deepEqual(block.format,'section');
		t.deepEqual(block.blocks.length,4);
		block.blocks.forEach(function(element) {
			t.deepEqual(element.format,'html');
		});
		textblock.outputTextBlock(block, function(err, str) {
			t.ifError(err);
			t.deepEqual(str, '<h1>head</h1><p>blah\nblah bla#h\n</p><h1>head2</h1><p>blah2\n</p><h1>head3</h1><p></p><h2>head4</h2><p></p>');
			t.end();
		});
	});
});


/**
 * Test that we can input markdown and that it stores the source 
 * and also that it formats it properly
 */
test('text_block markdown', function (t) {
	t.plan(5);
	var input = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
	textblock.makeTextBlock(input,'markdown', function (err, block) {
		t.deepEqual(block.format,'markdown');
		t.ok(block.hasOwnProperty('source'));
		t.ok(block.hasOwnProperty('htmltext'));
		textblock.outputTextBlock(block, function(err, str) {
			t.ifError(err);
			t.deepEqual(str, '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>');
			t.end();
		});
	});
});

/*
 * Ensures that we accept 'plainishtext' and that it gets encoded
 * as HTML properly
 */ 
test('text_block plainishtext', function (t) {
	t.plan(2);
	textblock.makeTextBlock('&blah\n\nblah','plainishtext', function (err, block) {
		textblock.outputTextBlock(block, function(err, str) {
			t.ifError(err);
			t.deepEqual(str,"<p>&amp;blah</p>\n<p>blah</p>");
			t.end();
		});
	});
});

/*
 * Ensures that html is a passthrough
 */ 
test('text_block html', function (t) {
	t.plan(2);
	textblock.makeTextBlock('<div>Test</div>','html', function (err, block) {
		textblock.outputTextBlock(block, function(err, str) {
			t.ifError(err);
			t.deepEqual(str,"<div>Test</div>");
			t.end();
		});
	});
});

/*
 * Tests that we can make a text block and then make sections out of it.
 */
test('text_block section', function (t) {
	t.plan(2);
	textblock.makeTextBlock('&blah\n\nblah','plainishtext', function (err, block) {
		textblock.makeTextBlockSection(block, function(err, blocks) {
			textblock.outputTextBlock(blocks, function(err, str) {
				t.ifError(err);
				t.deepEqual(str,"<p>&amp;blah</p>\n<p>blah</p>");
				t.end();
			});
		});
	});
});
