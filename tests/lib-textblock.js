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
    textblock.outputTextBlock(inputBlock, 'fo', {}, function(err, text) {
      err.should.be.a('error');
      err.message.should.equal('unknown format: gonzo');
    });
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
      block.should.have.property('htmlslabs');
    });

    it('#outputTextBlock should work', function(cb) {
      var block = textblock.makeTextBlock(input,'markdown');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal('<h1>head</h1>\n<p>blah\nblah bla#h</p>\n<h1>head2</h1>\n<p>blah2</p>\n<h1>head3</h1>\n<h2>head4</h2>\n');
        cb(err);
      });
    });

    it('should handle zalgo unicode weirdness', function(cb) {
      var block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'markdown');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal("<p>" + zalgo + "</p>\n<p>" + awesome + "</p>\n");
        cb(err);
      });
    });

    describe('#validateTextBlock', function() {
      it ('should work', function() {
        var inputblock = {format: 'markdown', source: input};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('markdown');
        block.should.have.property('source');
        block.should.have.property('htmlslabs');
      });

      it ('should remove bad keys', function() {
        var inputblock = {format: 'markdown', htmltext: 'fer',
           gonzo: 'ponies', source: '# get'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('markdown');
        block.should.have.property('source');
        block.should.not.have.property('gonzo');
        block.should.have.property('htmlslabs');
        block.htmlslabs[0].should.equal('<h1>get</h1>\n');
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
    it('#makeTextBlock and #outputTextBlock should be a passthrough', function(cb) {
      var block = textblock.makeTextBlock('<div>Test</div>','html');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal("<div>Test</div>");
        cb(err);
      });
    });

    it('should preserve zalgo unicode hilarity', function(cb) {
      var block = textblock.makeTextBlock('<div>' + zalgo + awesome + '</div>','html');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal('<div>' + zalgo + awesome + '</div>');
        cb(err);
      });
    });

    it('should not preserve xss hilarity', function(cb) {
      var block = textblock.makeTextBlock('<svg/onload=alert(document.domain)>','html');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal('<svg></svg>');
        cb(err);
      });
    });

    describe('#validateTextBlock', function() {
      it ('should work', function() {
        var inputblock = {format: 'html', source: '<div>Test</div>'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.have.property('source');
        block.should.have.property('htmlslabs');
      });

      it ('should remove bad keys', function() {
        var inputblock = {format: 'html',
           gonzo: 'ponies', source: '<div>Test</div>'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.have.property('source');
        block.should.not.have.property('gonzo');
        block.should.have.property('htmlslabs');
        block.htmlslabs[0].should.equal('<div>Test</div>');
      });

      it ('should also accept htmltext', function() {
        var inputblock = {format: 'html',
           source: '<div>Test</div>'};
        var block = textblock.validateTextBlock(inputblock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.have.property('source');
        block.should.not.have.property('gonzo');
        block.should.have.property('htmlslabs');
        block.htmlslabs[0].should.equal('<div>Test</div>');
      });

      it('should prevent xss hilarity', function() {
        var inBlock = textblock.makeTextBlock('<script>alert("foo")</script>','html');
        var block = textblock.validateTextBlock(inBlock);
        block.should.have.property('format');
        block.format.should.equal('html');
        block.should.have.property('htmlslabs');
        block.htmlslabs[0].should.equal('');
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

  describe('with plainishtext', function() {
    /*
     * Ensures that we accept 'plainishtext' and that it gets encoded
     * as HTML properly
     */
    it('should work', function(cb) {
      var block = textblock.makeTextBlock('<p>&blah\n\nblah','plainishtext');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal("<p>&lt;p>&blah</p>\n<p>blah</p>");
        cb(err);
      });
    });

    /*
     * Tests that unicode hilarity is preserved.
     */
    it('should preserve zalgo unicode hilarity', function(cb) {
      var block = textblock.makeTextBlock(zalgo + '\n\n' + awesome,'plainishtext');
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal("<p>" + zalgo + "</p>\n<p>" + awesome + "</p>");
        cb(err);
      });
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

  describe('with sections', function() {
    /*
     * Tests that we can make a text block and then make sections out of it.
     */
    it('should make sections', function(cb) {
      var block = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var blocks = textblock.makeTextBlockSection(block);
      textblock.outputTextBlock(blocks, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal("<p>&blah</p>\n<p>blah</p>");
        cb(err);
      });
    });

    it('should make arrays of sections', function(cb) {
      var block1 = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var block2 = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var blocks = textblock.makeTextBlockSection([block1, block2]);
      textblock.outputTextBlock(blocks, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal("<p>&blah</p>\n<p>blah</p><p>&blah</p>\n<p>blah</p>");
        cb(err);
      });
    });

    it('#extractTextBlockText should work', function() {
      var block1 = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var block2 = textblock.makeTextBlock('&blah\n\nblah','plainishtext');
      var inBlock = textblock.makeTextBlockSection([block1, block2]);
      var str = textblock.extractTextBlockText(inBlock);
      str.should.equal('&blah\nblah&blah\nblah');
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
        block.blocks[0].should.have.property('htmlslabs');
        block.blocks[0].should.have.property('source');
        block.blocks[1].should.have.property('format');
        block.blocks[1].should.have.property('htmlslabs');
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

  describe('with custom sections', function() {
    before (function() {
      textblock.registerTextBlockType('custom', function(block) {
        if (block.hasOwnProperty('source')) {
          var output = block.source;
          return {source: output, format: 'custom'};
        }
        throw new Error('html block has neither source nor htmltext');
      }, function(input, pos, ctx, callback) {
        setTimeout(function() {
          callback(null, '{' + input.source + '}[' + pos + ']');
        }, 10);
      });
    });

    it('should forbid duplicate custom sections', function() {
      (function() {
        textblock.registerTextBlockType('custom',
          function(input, callback) {},
          function(input, callback) {});
      }).should.throw('Format custom already exists');
    });

    it ('#validateTextBlock should work correctly', function() {
      var inputBlock = {format: 'custom',
        'source': 'curls'
      };
      var block = textblock.validateTextBlock(inputBlock, null);
      block.should.have.property('source');
      block.should.have.property('format');
      block.source.should.equal('curls');
      block.format.should.equal('custom');
    });

    it('#extractTextBlockText should ignore', function() {
      var inBlock = {format: 'custom',
        'source': 'curls'
      };
      var str = textblock.extractTextBlockText(inBlock);
      str.should.equal('');
    });

    it ('#outputTextBlock should work correctly', function(cb) {
      var inputBlock = {format: 'custom',
        'source': 'curls'
      };
      textblock.outputTextBlock(inputBlock, 'fo', {}, function(err, text) {
        if (err) {
          should.fail();
        }
        text.should.equal('{curls}[fo]');
        cb();

      });
    });

    it ('#outputTextBlock should work correctly with sections', function(cb) {
      var inputBlock = {format: 'section',
        blocks: [
          {format: 'custom',
            'source': 'curls'
          },
          {format: 'custom',
            'source': 'bunny'
          }
        ]
      };
      textblock.outputTextBlock(inputBlock, 'fo', {}, function(err, text) {
        if (err) {
          should.fail();
        }
        text.should.equal('{curls}[fo_0]{bunny}[fo_1]');
        cb();

      });
    });
  });

  describe('with textual enhancement', function() {
    before (function() {
      textblock.registerEnhancement('fl',function enhanceHtml($, generatePlaceholder) {
        $('img').each(function(i, elem) {
          var srcUrl = $(this).attr('src');
          var placeholder;
          if (srcUrl === '/blah/') {
            placeholder = generatePlaceholder($, 'fl', $(this).attr(''));
            $(this).replaceWith(placeholder);
          }
          if (srcUrl === '/error/') {
            placeholder = generatePlaceholder($, 'fl', {'error': true});
            $(this).replaceWith(placeholder);
          }
        });
      }, function(input, ctx, callback) {
        setTimeout(function() {
          if (input.hasOwnProperty('error')) {
            return callback(new Error('error'));
          }
          callback(null, 'fffffff');
        }, 10);
      });
    });

    it('#validateTextBlock and #outputTextBlock should work', function(cb) {
      var inBlock = textblock.makeTextBlock('<img src="/blah/"><p>Do stuf</p><p>More stuf</p><img src="http://www.example.org/">','html');
      var block = textblock.validateTextBlock(inBlock);
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          should.fail();
        }
        str.should.equal('fffffff<p>Do stuf</p><p>More stuf</p><img src="http://www.example.org/">');
        cb(err);
      });
    });

    it('#extractTextBlockText should work', function() {
      var inBlock = textblock.makeTextBlock('<img src="/blah/"><p>Do stuf</p><p>More stuf</p><img src="http://www.example.org/">','html');
      var str = textblock.extractTextBlockText(inBlock);
      str.should.equal('Do stufMore stuf');
    });

    it('#outputTextBlock should handle errors', function(cb) {
      var inBlock = textblock.makeTextBlock('<img src="/error/"><p>Do stuf</p><p>More stuf</p><img src="http://www.example.org/">','html');
      var block = textblock.validateTextBlock(inBlock);
      textblock.outputTextBlock(block, 'fo', {}, function(err, str) {
        if (err) {
          cb();
        }
        should.fail();
      });
    });
  });
});
