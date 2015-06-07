# Text Blocks

[![Build Status](https://travis-ci.org/wirehead/textblocks.svg?branch=master)](https://travis-ci.org/wirehead/textblocks)

While slinging structured text, it's kinda nice to be able to not have to be too concerned with exactly how your text is formatted, so that you can just say "Hey, this area's a structured text block" and not worry if the user wants to publish their content in Markdown or HTML or whatever.  You can kinda make this work with XHTML + XML Namespaces + XML processing code, but I wrote some code that worked that way and it was messy and I could never make it especially fast.

Enter Text Blocks.

## WTF is a text block?

A Text Block is a thin JSON wrapper atop multiple markup systems and a ways and means to slice text at the header border.

A Text Block Node is a JSON object with a few properties.  'source' is the source in the format intended for user manipulation -- wikitext, markdown, html, etc. 'htmltext' is the source that has been pre-processed into HTML. 'format' is what format to expect the text in.  'blocks' is the child nodes.

Thus, pre-conversions, like converting markdown to HTML, would happen only when the content changes.

You can accumulate Text Block Nodes into a set of sections, where each section can be in a different format.  You can also create 'pragma' sections for things like database queries.  Eventually, I'm going to extend Text Block Nodes to allow multi-lingual collections.

## Supported input formats

 * 'plainishtext' - Escapes text to HTML For display
 * 'html' - Accepts HTML, using sanitize-caja to protect from XSS
 * 'markdown' - Markdown

There's atxplaintext, which is probably going to go away.. it's there to exercise the auto-splitting for the time being.

## How do I use it?

`npm run docs` to generate markdown docs

### Creating a textblock 

```node
var markdown = '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4';
var textblock = textblock.makeTextBlock(markdown,'markdown');
```

### Validating a textblock submitted externally

(When you are using either query-string parsing of form elements or JSON form submission, you can actually make a textblock editor out of HTML form components)

```node
var sections = {format: 'section', 
  blocks: [
    {format: 'markdown', source: '# head\n\nblah\nblah bla#h\n\n# head2\n\nblah2\n\n# head3\n\n## head4', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
    {format: 'plainishtext', source: 'candy'},
    {format: 'html', htmltext: '<h1>head</h1>\n\n<p>blah\nblah bla#h</p>\n\n<h1>head2</h1>\n\n<p>blah2</p>\n\n<h1>head3</h1>\n\n<h2>head4</h2>'},
  ]
};
var outputTextblock = textblock.validateTextBlock(textblock);
```

### Outputting a textblock

```node
var outputString = textblock.outputTextBlock(textblock);
```

## Performance notes

`npm run benchmark`

The performance is mostly to do with the underlying Markdown and XSS-prevention libraries, I suspect.

## Contributing

If you've found a bug:
 * Submit away!

If you'd like to submit a PR:
 * I do not expect you to smash multiple commits into a single commit.
 * Unless you say otherwise, I'm assuming "maintainer-fixes" style of merging, where I fix any quibbles and potentially make minor tweaks.  If you specify "maintainer-reviews", I'll maintain a list of things that I've identified for you to change.
 * If you've got a major patch in mind that's larger than an easily-mergable patch, you might consider writing up a blueprint describing what you want to do.

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms -- see code_of_conduct.md

## License?

BSD, see LICENSE.txt
