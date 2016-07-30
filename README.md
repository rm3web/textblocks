# Text Blocks

[![Build Status](https://travis-ci.org/rm3web/textblocks.svg?branch=master)](https://travis-ci.org/rm3web/textblocks)[![Dependency Status](https://david-dm.org/rm3web/textblocks.svg)](https://david-dm.org/rm3web/textblocks)[![devDependency Status](https://david-dm.org/rm3web/textblocks/dev-status.svg)](https://david-dm.org/rm3web/textblocks#info=devDependencies)[![npm version](https://badge.fury.io/js/textblocks.svg)](https://www.npmjs.com/package/textblocks)[![codecov](https://codecov.io/gh/rm3web/textblocks/branch/master/graph/badge.svg)](https://codecov.io/gh/rm3web/textblocks)

While slinging structured text, it's kinda nice to be able to not have to be too concerned with exactly how your text is formatted, so that you can just say "Hey, this area's a structured text block" and not worry if the user wants to publish their content in Markdown or HTML or whatever.

At the same time, it's helpful to insert application-specific content blocks (like content queries to build an index page, image blocks, etc) without trying to fit it into pathalogically weird XML inserted into a HTML document.

And it's also nice to have this not be excessively slow to render.  I wrote some code that did a bunch of DOM operations on a mixture of namespaced XML and XHTML and it was really slow.

Enter Text Blocks.

## WTF is a text block?

A Text Block is a thin JSON wrapper atop arbitrary markup systems and a ways and means to slice text at the header border.

A Text Block Node is a JSON object with a few properties.  'source' is the source in the format intended for user manipulation -- wikitext, markdown, html, etc. 'htmlslabs' is the source that has been pre-processed into HTML. 'format' is what format to expect the text in.  'blocks' is the child nodes.

Thus, pre-conversions, like converting markdown to HTML, would happen only when the content changes.

You can accumulate Text Block Nodes into a set of sections, where each section can be in a different format.  You can also create 'pragma' sections for things like database queries.  Eventually, I'm going to extend Text Block Nodes to allow multi-lingual collections.

## Supported input formats

 * 'plainishtext' - Escapes text to HTML For display
 * 'html' - Accepts HTML, using sanitize-caja to protect from XSS
 * 'markdown' - Markdown

## [Client-side React editor](https://github.com/rm3web/textblocks-react-editor)

There's a (currently a bit unstable and featureless) React editor for textblocks that uses query-string parsing of form field names.

## How do I use it?

`npm run docs` to generate markdown docs

### How do I create a textblock from source?

```node
var markdown = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
var textblock = textblock.makeTextBlock(markdown,'markdown');
```

### How do I accept JSON formatted textblocks from an untrusted source?

(When you are using either query-string parsing of form elements or JSON form submission, you can actually make a textblock editor out of HTML form components)

```node
var sections = {format: 'section', 
  blocks: [
    {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmlslabs: ['<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>']},
    {format: 'plainishtext', source: 'candy', htmlslabs:['candy']},
    {format: 'html', htmlslabs: ['<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>']},
  ]
};
var outputTextblock = textblock.validateTextBlock(textblock);
```

### How do I output a stored textblock?

```node
var outputString = textblock.outputTextBlock(textblock, 'block', {context: 'here'}, function(err, text) {
  if (err) {
    // The render failed
  } else {
    console.log(text);
  }
});
```

(The `block` paramater is the 'name' of the section, for binding interactive components, and the `{context:'here'}` section is passed to custom rendering functions, so you can pass in a DB connection or the like)

## Is it fast?

`npm run benchmark`

The performance is mostly to do with the underlying Markdown and XSS-prevention libraries, I suspect.

The performance goal is to avoid render-time complexity.  If there's expensive DOM traversal (say, finding all of the images and making sure they are set up properly) it needs to be done at the edit-time.

## Contributing

* `npm run lint` to lint
* `npm run benchmark` to check the benchmarks
* `npm test` to test
* `npm run coverage` to check test coverage

If you've found a bug:
 * Submit away!

If you'd like to submit a PR:
 * I do not expect you to smash multiple commits into a single commit.
 * Unless you say otherwise, I'm assuming "maintainer-fixes" style of merging, where I fix any quibbles and potentially make minor tweaks.  If you specify "maintainer-reviews", I'll maintain a list of things that I've identified for you to change.
 * If you've got a major patch in mind that's larger than an easily-mergable patch, you might consider writing up a blueprint describing what you want to do.

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms -- see [code of conduct](code_of_conduct.md)

## License?

BSD, see LICENSE.txt
