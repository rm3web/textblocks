# Text Blocks

While slinging structured text, it's kinda nice to be able to not have to be too concerned with exactly how your text is formatted, so that you can just say "Hey, this area's a structured text block" and not worry if the user wants to push in Markdown or HTML or whatever.

Enter Text Blocks.

## WTF is a text block?

A Text Block is a thin JSON wrapper atop multiple markup systems and a ways and means to slice text at the header border.

A Text Block Node is a JSON object with a few properties.  'source' is the source in the format intended for user manipulation -- wikitext, markdown, html, etc. 'htmltext' is the source that has been pre-processed into HTML. 'vars' is the variable substitutions. 'format' is what format to expect the text in.  'blocks' is the child nodes.

Thus, pre-conversions, like converting markdown to HTML, would happen only when the content changes.

You can accumulate Text Block Nodes into a multi-lingual collection or into a list of sections.

## Supported input formats

 * 'plainishtext' - Escapes text to HTML For display
 * 'atxplaintext' - Converts along the headings to seperate sections
 * 'markdown' - Markdown

atxplaintext may eventually go away.. it's there to exercise the auto-splitting for the time being.  And there's no way to input html.

## Do I care?

Probably not.  It's not done yet.  It's been lying around on my HD for a long while now and I figured it's a discrete open-sourceable chunk.

## Contributing

I'd say "Patches welcome" but that's too passive-aggressive.

Patches welcome! :)

## License?

BSD, see LICENSE.txt
