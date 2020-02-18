# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Changed
- update deps
- removed support for old node versions.

## [0.0.22] - 2017-06-17
### Changed
 - Updated deps
 - Added support for new node versions.

## [0.0.21] - 2017-06-17
### Changed
 - Updated deps

## [0.0.20] - 2017-02-25
### Added
- `deleteTextBlockFormat` added, for if you want to remove a specific block type.

## [0.0.19] - 2017-01-01
### Fixed
 - Textual Enrichment was broken slightly with sections

## [0.0.18] - 2017-01-01
### Added
 - Textual Enrichment needs to pass a context while generating placeholders.

### Changed
 - Updated deps
 - Fixed lint

## [0.0.17] - 2016-10-09
### Changed
 - Updated deps
 - Allowable markdown changed to allow GFM-styled tables.
 - Add [markdown-it-deflist](https://www.npmjs.com/package/markdown-it-deflist) as default
 - Export the markdown object so that the user can apply further customizations.

## [0.0.16] - 2016-8-21
### Added
 - Textual Enrichment needs to pass a context the same way custom blocks does.
 - Markdown-it-attrs added

### Changed
 - Updated deps

## [0.0.15] - 2016-8-14
### Added
 - `extractTextBlockText` to get just the text and ignore all custom block types.

### Changed
 - Updated deps

## [0.0.14] - 2016-7-30
### Added
 - Textual enrichment allows users to replace tags with intelligent content at render time.

### Changed
 - Replaced caja with DOMPurify

### Fixed
 - Some of the unit tests weren't set up to work as async.

### Removed
 - Pragma blocks are gone; Custom textblocks do everything pragma blocks did and more.

## [0.0.13] - 2016-7-10
### Changed
 - BREAKING: Passing a pos string to `outputTextBlock`.

## [0.0.12] - 2016-7-10
### Changed
 - BREAKING: Passing a context object in `outputTextBlock`.

## [0.0.11] - 2016-7-9
### Added
 - Custom textblocks

### Changed
 - Updated deps

## [0.0.10] - 2016-5-21
### Changed
 - BREAKING: Storage format now based on slabs.  Instead of storing just a single string for the 'htmltext' field, we now store an array of strings in the 'htmlslabs' field.
 - BREAKING: Restoring async interface.
 - Updated deps
 - eslint instead of jshint
 - Supported versions of node.js are 4.0 and 5.0

### Removed
 - atxplaintext

## [0.0.9] - 2016-1-10
### Added
 - Changelog, for the first time
 - Moved git repo.

### Changed
 - Updated deps

## 0.0.8 - Accidental push

## 0.0.7 - 2015-9-27
### Added
 - Index to which pragma is being processed, for pagination

## 0.0.6 - 2015-6-7
### Changed
 - Switch from Markdown to Markdown-it

## 0.0.5 - 2015-6-7
### Added
 - XSS Prevention
 - Pragma nodes
 - Benchmarks
 - Code Of Conduct
 - Better docs
 - Improved test coverage
 - Checks for invalid textblock structure

### Changed
 - updated deps

## 0.0.4 - 2015-6-6
### Added
 - Zalgo and awesome unicode tests.
 - JSON payload validation

### Changed
 - Refactored unit tests using Mocha instead of Tape.
 - updated deps

## 0.0.3 - Oct 26, 2014
### Changed
 - updated deps
 - BREAKING: Async interface removed, everything is now synchronous.

## 0.0.2 - Oct 26, 2014
### Added
 - HTML passthrough
 - Documentation

### Changed
 - updated deps

## 0.0.1
### Added
 - Initial version

[Unreleased]: https://github.com/rm3web/textblocks/compare/v0.0.21...HEAD
[0.0.21]: https://github.com/rm3web/textblocks/compare/v0.0.20...v0.0.21
[0.0.20]: https://github.com/rm3web/textblocks/compare/v0.0.19...v0.0.20
[0.0.19]: https://github.com/rm3web/textblocks/compare/v0.0.18...v0.0.19
[0.0.18]: https://github.com/rm3web/textblocks/compare/v0.0.17...v0.0.18
[0.0.17]: https://github.com/rm3web/textblocks/compare/v0.0.16...v0.0.17
[0.0.16]: https://github.com/rm3web/textblocks/compare/v0.0.15...v0.0.16
[0.0.15]: https://github.com/rm3web/textblocks/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/rm3web/textblocks/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/rm3web/textblocks/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/rm3web/textblocks/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/rm3web/textblocks/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/rm3web/textblocks/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/rm3web/textblocks/compare/v0.0.8...v0.0.9