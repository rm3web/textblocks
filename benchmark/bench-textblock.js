/* global suite */
/* global bench */
var textblock = require('../lib/textblock');
var async = require('async');

suite('textblock#makeTextBlock', function() {
  var markdown = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
  var html = '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>';

  bench('markdown', function() {
    var block = textblock.makeTextBlock(markdown,'markdown');
  });

  bench('html', function() {
    var block = textblock.makeTextBlock(html,'html');
  });

  bench('plainishtext', function() {
    var block = textblock.makeTextBlock(html,'plainishtext');
  });

});

suite('textblock#validateTextBlock', function() {
  var sections = {format: 'section',
    blocks: [
      {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
      {format: 'plainishtext', source: 'candy'},
      {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'}
    ]
  };

  var pragmaSections = {format: 'section',
    blocks: [
      {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
      {format: 'pragma', source: 'gogogogogosetr', go: 135},
      {format: 'plainishtext', source: 'candy'},
      {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'}
    ]
  };

  var html = {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'};
  var plain = {format: 'plainishtext', source: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'};
  var markdown = {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'};

  bench('sections', function() {
    var block = textblock.validateTextBlock(sections);
  });

  bench('pragma_sections', function() {
    var block = textblock.validateTextBlock(pragmaSections,
      function(pragma) {
        return {format:'html', htmltext: ''};
      });
  });

  bench('html', function() {
    var block = textblock.validateTextBlock(html);
  });

  bench('markdown', function() {
    var block = textblock.validateTextBlock(markdown);
  });

  bench('plain', function() {
    var block = textblock.validateTextBlock(plain);
  });

});

suite('textblock#outputTextBlock', function() {
  var sections = {format: 'section',
    blocks: [
      {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
      {format: 'plainishtext', source: 'candy'},
      {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'}
    ]
  };

  var html = {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'};
  var plain = {format: 'plainishtext', source: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'};
  var markdown = {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'};

  bench('sections', function(callback) {
    var block = textblock.outputTextBlock(sections, callback);
  });

  bench('html', function(callback) {
    var block = textblock.outputTextBlock(html, function(err, text) {
      async.setImmediate(function() {
        callback(err, text);
      });
    });
  });

  bench('markdown', function(callback) {
    var block = textblock.outputTextBlock(markdown, function(err, text) {
      async.setImmediate(function() {
        callback(err, text);
      });
    });
  });

  bench('plain', function(callback) {
    var block = textblock.outputTextBlock(plain, function(err, text) {
      async.setImmediate(function() {
        callback(err, text);
      });
    });
  });
});

suite('textblock#resolvePragmaBlocks', function() {
  var sections = {format: 'section',
    blocks: [
      {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
      {format: 'plainishtext', source: 'candy'},
      {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'}
    ]
  };

  var pragmaSections = {format: 'section',
    blocks: [
      {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
      {format: 'pragma', source: 'gogogogogosetr', go: 135},
      {format: 'plainishtext', source: 'candy'},
      {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'}
    ]
  };

  bench('no pragmas', function(cb) {
    textblock.resolvePragmaBlocks(sections, 'pos', function(block, pos, next) {
      next(null, {format:'html', htmltext: '<div>candy</div>'});
    }, function(err, block) {
      cb(err);
    });
  });

  bench('one pragma', function(cb) {
    textblock.resolvePragmaBlocks(pragmaSections, 'pos', function(block, pos, next) {
      next(null, {format:'html', htmltext: '<div>candy</div>'});
    }, function(err, block) {
      cb(err);
    });
  });
});
