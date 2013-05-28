var textblock = require('../lib/textblock');


/**
 * Test that we can input 'atxplaintext' and that it turns four sections
 * into individual text blocks
 */
exports['test_text_block_atxplaintext'] = function (test, assert) {
	var input = '# head\n\nblah\nblah bla#h\n# head2\n\nblah2\n# head3\n## head4'
	textblock.makeTextBlock(input,'atxplaintext', function (err, block) {
		assert.deepEqual(block.format,'section');
		assert.deepEqual(block.blocks.length,4);
		block.blocks.forEach(function(element) {
			assert.deepEqual(element.format,'html')
		});
		textblock.outputTextBlock(block, function(err, str) {
			assert.ifError(err);
			assert.deepEqual(str, '<h1>head</h1><p>blah\nblah bla#h\n</p><h1>head2</h1><p>blah2\n</p><h1>head3</h1><p></p><h2>head4</h2><p></p>')
			test.finish();
		});
	});
};


/**
 * Test that we can input markdown and that it stores the source 
 * and also that it formats it properly
 */
exports['test_text_block_markdown'] = function (test, assert) {
	var input = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4'
	textblock.makeTextBlock(input,'markdown', function (err, block) {
		assert.deepEqual(block.format,'markdown');
		assert.ok(block.hasOwnProperty('source'));
		assert.ok(block.hasOwnProperty('htmltext'));
		textblock.outputTextBlock(block, function(err, str) {
			assert.ifError(err);
			assert.deepEqual(str, '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>');
			test.finish();
		});
	});
};

/*
 * Ensures that we accept 'plainishtext' and that it gets encoded
 * as HTML properly
 */ 
exports['test_text_block'] = function(test, assert) {
	textblock.makeTextBlock('&blah\n\nblah','plainishtext', function (err, block) {
		textblock.outputTextBlock(block, function(err, str) {
			assert.ifError(err);
			assert.deepEqual(str,"<p>&amp;blah</p>\n<p>blah</p>");
			test.finish();
		});
	});
};


/*
 * Tests that we can make a text block and then make sections out of it.
 */
exports['test_text_block_section'] = function(test, assert) {
	textblock.makeTextBlock('&blah\n\nblah','plainishtext', function (err, block) {
		textblock.makeTextBlockSection(block, function(err, blocks) {
			textblock.outputTextBlock(blocks, function(err, str) {
				assert.ifError(err);
				assert.deepEqual(str,"<p>&amp;blah</p>\n<p>blah</p>");
				test.finish();		
			});
		});
	});
};
