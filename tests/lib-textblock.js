var textblock = require('../lib/textblock');
var should = require('chai').should();

// Zalgo haunts the internet seeking evil, danger, and people who parse XHTML with
// regexes.
var zalgo = "\u005A\u0340\u035A\u0318\u0061\u035C\u0329\u0318\u0339\u0320\u006C\u035E\u0332\u0067\u0315\u0324\u0348\u033C\u0324\u031E\u006F\u0338\u0349\u0325";
// A former coworker of mine accidentally broke a bunch of stuff with the script A.
var awesome = "\uD835\uDC9C\u0077\u0065\u0073\u006F\u006D\u0065";

describe('textblock', function() {

  it('#makeTextBlock should reject invalid blocks', function() {
    (function() {
      var block = textblock.makeTextBlock(awesome,zalgo);
    }).should.throw('invalid format to make a text block from');
  });

  it('#validateTextBlock should reject invalid blocks', function() {
    var inputBlock = {format: 'gonzo',
      gonzo: 'zalgo'
    };
    (function() {
      var block = textblock.validateTextBlock(inputBlock);
    }).should.throw('invalid format for textblock');
  });

  it('#validateTextBlock should reject non-Objects', function() {
    var inputBlock = '{"goo":"goo"}';
    (function() {
      var block = textblock.validateTextBlock(inputBlock);
    }).should.throw('invalid format for textblock');
  });

  it('#outputTextBlock should reject invalid blocks', function() {
    var inputBlock = {format: 'gonzo',
      gonzo: 'zalgo'
    };
    (function() {
      var out = textblock.outputTextBlock(inputBlock);
    }).should.throw('invalid format to output');
  });

  describe('with markdown', function() {
    var input = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
    /**
     * Test that we can input markdown and that it stores the source
     * and also that it formats it properly
     */
    it('#makeTextBlock should work', function() {
      var block = textblock.makeTextBlock(input,'markdown');
      block.format.should.equal('markdown');
      block.should.have.property('source');
      block.should.have.property('htmltext');
    });

    it('#outputTextBlock should work', function() {
      var block = textblock.makeTextBlock(input,'markdown');
      var str = textblock.outputTextBlock(block);
      str.should.equal('<h1>head</h1>\n<p>blah\nblah bla#h</p>\n<h1>head2</h1>\n<p>blah2</p>\n<h1>head3</h1>\n<h2>head4</h2>\n');
    });

    it('should handle zalgo unicode weirdness', function() {
      var block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'markdown');
      var str = textblock.outputTextBlock(block);
      str.should.equal("<p>" + zalgo + "</p>\n<p>" + awesome + "</p>\n");
    });

    describe('#validateTextBlock', function() {
      it ('should work', function() {
        var inputblock = {format: 'markdown', source: input};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('markdown');
        block.should.have.property('source');
        block.should.have.property('htmltext');
      });

      it ('should remove bad keys', function() {
        var inputblock = {format: 'markdown', htmltext: 'fer',
           gonzo: 'ponies', source: '# get'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('markdown');
        block.should.have.property('source');
        block.should.not.have.property('gonzo');
        block.should.have.property('htmltext');
        block.htmltext.should.equal('<h1>get</h1>\n');
      });

      it ('should throw an exception with no content', function() {
        var inputBlock = {format: 'markdown',
          gonzo: 'zalgo'
        };
        (function() {
          textblock.validateTextBlock(inputBlock);
        }).should.throw('markdown block has no source');
      });
    });
  });

  describe('with html', function() {
    /*
     * Ensures that html is a passthrough
     */
    it('#makeTextBlock and #outputTextBlock should be a passthrough', function() {
      var block = textblock.makeTextBlock('<div>Test</div>','html');
      var str = textblock.outputTextBlock(block);
      str.should.equal("<div>Test</div>");
    });

    it('should preserve zalgo unicode hilarity', function() {
      var block = textblock.makeTextBlock('<div>' + zalgo + awesome + '</div>','html');
      var str = textblock.outputTextBlock(block);
      str.should.equal('<div>' + zalgo + awesome + '</div>');
    });

    it('should not preserve xss hilarity', function() {
      var block = textblock.makeTextBlock('<svg/onload=alert(document.domain)>','html');
      var str = textblock.outputTextBlock(block);
      str.should.equal('');
    });

    describe('#validateTextBlock', function() {
      it ('should work', function() {
        var inputblock = {format: 'html', source: '<div>Test</div>'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.not.have.property('source');
        block.should.have.property('htmltext');
      });

      it ('should remove bad keys', function() {
        var inputblock = {format: 'html',
           gonzo: 'ponies', source: '<div>Test</div>'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.not.have.property('source');
        block.should.not.have.property('gonzo');
        block.should.have.property('htmltext');
        block.htmltext.should.equal('<div>Test</div>');
      });

      it ('should also accept htmltext', function() {
        var inputblock = {format: 'html',
           htmltext: '<div>Test</div>'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.not.have.property('source');
        block.should.not.have.property('gonzo');
        block.should.have.property('htmltext');
        block.htmltext.should.equal('<div>Test</div>');
      });

      it('should prevent xss hilarity', function() {
        var inBlock = textblock.makeTextBlock('<script>alert("foo")</script>','html');
        var block = textblock.validateTextBlock(inBlock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.have.property('htmltext');
        block.htmltext.should.equal('');
      });

      it ('should throw an exception with no content', function() {
        var inputBlock = {format: 'html',
          gonzo: 'zalgo'
        };
        (function() {
          textblock.validateTextBlock(inputBlock);
        }).should.throw('html block has neither source nor htmltext');
      });
    });
  });

  describe('with atxplaintext', function() {
    /**
     * Test that we can input 'atxplaintext' and that it turns four sections
     * into individual text blocks
     */
    it('should work', function() {
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

    describe('#validateTextBlock', function() {
      it ('should work', function() {
        var inputblock = {format: 'plainishtext', source: 'twt'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('plainishtext');
        block.should.have.property('source');
      });
    });
  });

  describe('with plainishtext', function() {
    /*
     * Ensures that we accept 'plainishtext' and that it gets encoded
     * as HTML properly
     */
    it('should work', function() {
      var block = textblock.makeTextBlock('<p>&blah\n\nblah','plainishtext');
      var str = textblock.outputTextBlock(block);
      str.should.equal("<p>&lt;p>&blah</p>\n<p>blah</p>");
    });

    /*
     * Tests that unicode hilarity is preserved.
     */
    it('should preserve zalgo unicode hilarity', function() {
      var block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'plainishtext');
      var str = textblock.outputTextBlock(block);
      str.should.equal("<p>" + zalgo + "</p>\n<p>" + awesome + "</p>");
    });

    it ('should throw an exception with no content', function() {
      var inputBlock = {format: 'plainishtext',
        gonzo: 'zalgo'
      };
      (function() {
        textblock.validateTextBlock(inputBlock);
      }).should.throw('plainishtext block has no source');
    });
  });

  describe('with pragma blocks', function() {
    it('should pass pragma blocks through while validating', function() {
      var inputblock = {format: 'pragma', query: 'fork', meta: true, spoon: 100};
      var block = textblock.validateTextBlock(inputblock);
      block.should.have.property('format');
      block.format.should.equal('pragma');
      block.should.have.property('query');
      block.query.should.equal('fork');
      block.should.have.property('meta');
      block.meta.should.equal(true);
      block.should.have.property('spoon');
      block.spoon.should.equal(100);
    });

    it('should validate pragamas if a function is provided', function() {
      var inputblock = {format: 'pragma', query: 'fork', meta: true, spoon: 100};
      var block = textblock.validateTextBlock(inputblock, function(b) {
        b.should.have.property('format');
        b.format.should.equal('pragma');
        b.should.have.property('query');
        b.query.should.equal('fork');
        b.should.have.property('meta');
        b.meta.should.equal(true);
        b.should.have.property('spoon');
        b.spoon.should.equal(100);
        return {format: 'pragma', query: 'blah'};
      });
      block.should.have.property('format');
      block.format.should.equal('pragma');
      block.should.have.property('query');
      block.query.should.equal('blah');
    });

    describe('should resolve pragmas', function() {
      it('in a lone block', function(cb) {
        var inputblock = {format: 'pragma', query: 'fork', meta: true, spoon: 100};
        textblock.resolvePragmaBlocks(inputblock, 'goo', function(block, pos, next) {
          pos.should.equal('goo');
          next(null, {format: 'plainishtext', source: 'blah blah'});
        }, function(err, block) {
          should.not.exist(err);
          should.exist(block);
          block.should.have.property('format');
          block.should.have.property('source');
          block.source.should.equal('blah blah');
          block.format.should.equal('plainishtext');
          cb(err);
        });
      });

      it('with errors', function(cb) {
        var inputblock = {format: 'section',
          blocks: [
          {format: 'pragma', query: 'fork', meta: true, spoon: 100},
          {format: 'plainishtext', source: 'candy'}
          ]
        };
        textblock.resolvePragmaBlocks(inputblock, 'moo', function(block, pos, next) {
          pos.should.equal('moo_0');
          next(new Error('inserted'));
        }, function(err, block) {
          should.exist(err);
          should.not.exist(block);
          cb();
        });
      });

      it('in sections', function(cb) {
        var inputblock = {format: 'section',
          blocks: [
          {format: 'pragma', query: 'fork', meta: true, spoon: 100},
          {format: 'plainishtext', source: 'candy'}
          ]
        };
        textblock.resolvePragmaBlocks(inputblock, 'moo', function(block, pos, next) {
          pos.should.equal('moo_0');
          next(null, {format: 'plainishtext', source: 'blah blah'});
        }, function(err, block) {
          should.not.exist(err);
          should.exist(block);
          block.should.have.property('format');
          block.should.have.property('blocks');
          block.format.should.equal('section');
          block.blocks.should.have.length(2);
          block.blocks[0].should.have.property('format');
          block.blocks[0].should.have.property('source');
          block.blocks[0].source.should.equal('blah blah');
          block.blocks[0].format.should.equal('plainishtext');
          block.blocks[1].source.should.equal('candy');
          cb(err);
        });
      });
    });
  });

  describe('with sections', function() {
    /*
     * Tests that we can make a text block and then make sections out of it.
     */
    it('should make sections', function() {
      var block = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var blocks = textblock.makeTextBlockSection(block);
      var str = textblock.outputTextBlock(blocks);
      str.should.equal("<p>&blah</p>\n<p>blah</p>");
    });

    it('should make arrays of sections', function() {
      var block1 = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var block2 = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var blocks = textblock.makeTextBlockSection([block1, block2]);
      var str = textblock.outputTextBlock(blocks);
      str.should.equal("<p>&blah</p>\n<p>blah</p><p>&blah</p>\n<p>blah</p>");
    });

    describe('#validateTextBlock', function() {
      it ('should work', function() {
        var inputblock = {format: 'section',
          maxnum: 134,
          blocks: [
            {format: 'plainishtext', source: 'blah blah'},
            {format: 'html', source: '<h1>blah</h1>', mf: 'et'}
          ]
        };
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('section');
        block.should.not.have.property('source');
        block.should.not.have.property('htmltext');
        block.should.not.have.property('maxnum');
        block.blocks[0].should.have.property('format');
        block.blocks[0].should.not.have.property('htmltext');
        block.blocks[0].should.have.property('source');
        block.blocks[1].should.have.property('format');
        block.blocks[1].should.have.property('htmltext');
      });
    });

    it ('should throw an exception with an invalid block type', function() {
      var inputBlock = {format: 'section',
        blocks: [
          {format: 'gaga', source: 'gonzo'}
        ]
      };
      (function() {
        textblock.validateTextBlock(inputBlock);
      }).should.throw('validating textblock with invalid block type');
    });
  });
});
