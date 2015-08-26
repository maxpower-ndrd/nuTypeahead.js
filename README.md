[nuTypeahead.js][gh-page]
=======================

This is a clone of the twitter typeahead.js library. The original author does not see it part of the 
project's vision that typeahead is a multi-select type library. Keeping in mind that the typeahead team
isn't under any obligation to implement user-requested features, this project was forked to support:
* @ sign prefix for triggering autocompletion (prefix is configurable). [DONE]
* multiple auto-completions per input field [DONE]
* ~~possibly support multiple triggers in the same fields (e.g, @ and #)~~ [NOTYET]

The original documentation is shown below, it hasn't been updated yet. This project is a fresh fork, 
and the modified code hasn't been uploaded yet. I'm a js n00b and ~~trying to figure out how to compile 
the LESS scripts and create minified versions, so bear with me~~ just found out this project uses grunt. Grunt/npm installed. Initial changes ported into the code. Testing remains. This should be done in a couple of days.

Getting nuTypeahead.js
-------------------

At the moment, the only way to get this lib is to download the following files:
* dist/typeahead.bundle.js
* dist/typeahead.bundle.min.js

The bundle.js is the combined bloodhound and the typeahead.jquery file, so those two files are enough for dev and prod use.

Of course, you can download the entire src as zip or git clone it.

Example usage will be added shortly. A very basic working version of this lib is what you'll find in the repo.

Example usage:
--------------

The following usage shows how to specify a prefix that will trigger autocompletion using remote data.

Notes:
* The following example uses handlebars to compile a client side template.
* %QUERY is the wildcard. That means typeahead will automatically replace %QUERY with the actual query string
* 

```
		var husers = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizers.obj.whitespace('Name'),
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			remote: {
				url: 'http://remoteurl.example.com/api/SearchUsers/%QUERY',
				wildcard: '%QUERY'
			}
		});

		$('.typeahead').typeahead({
			minLength: 1,
			highlight: true,  // highlight isn't requried for this project
			trigger: '@'  // can be #, !, or any other char
		},
		{
			name: 'husers',
			display: 'Name',
			source: husers,
			templates: {
				empty: [
					'<div class="empty-message">',
						'No users found by that name',
					'</div>'
				].join('\n'),
				suggestion: Handlebars.compile('<div class="namelookup-popup"><img class="image" src="{{Picture}}" /><div class="content"><div class="text">{{Name}}</div><div class="text"></div></div></div>')
			}
		});
		```

 Sample output from a service might be of the form shown below. This is all standard typeahead.js stuff.
 
 ```
 [{"ID":"0","Name":"nuser1","Image":"image1.jpg"},{"ID":"1","Name":"nuser2","Image":"image2.jpg"}]
 ```
 
------

Original content:

[![build status](https://secure.travis-ci.org/twitter/typeahead.js.svg?branch=master)](http://travis-ci.org/twitter/typeahead.js)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Inspired by [twitter.com]'s autocomplete search functionality, typeahead.js is 
a flexible JavaScript library that provides a strong foundation for building 
robust typeaheads.

The typeahead.js library consists of 2 components: the suggestion engine, 
[Bloodhound], and the UI view, [Typeahead]. 
The suggestion engine is responsible for computing suggestions for a given 
query. The UI view is responsible for rendering suggestions and handling DOM 
interactions. Both components can be used separately, but when used together, 
they can provide a rich typeahead experience.

<!-- section links -->

[gh-page]: http://twitter.github.io/typeahead.js/
[twitter.com]: https://twitter.com
[Bloodhound]: https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md
[Typeahead]: https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md

Getting Started
---------------

How you acquire typeahead.js is up to you.

Preferred method:
* Install with [Bower]: `$ bower install typeahead.js`

Other methods:
* [Download zipball of latest release][zipball].
* Download the latest dist files individually:
  * *[bloodhound.js]* (standalone suggestion engine)
  * *[typeahead.jquery.js]* (standalone UI view)
  * *[typeahead.bundle.js]* (*bloodhound.js* + *typeahead.jquery.js*)
  * *[typeahead.bundle.min.js]*

**Note:** both *bloodhound.js* and *typeahead.jquery.js* have a dependency on 
[jQuery] 1.9+.

<!-- section links -->

[Bower]: http://bower.io/
[zipball]: http://twitter.github.com/typeahead.js/releases/latest/typeahead.js.zip
[bloodhound.js]: http://twitter.github.com/typeahead.js/releases/latest/bloodhound.js
[typeahead.jquery.js]: http://twitter.github.com/typeahead.js/releases/latest/typeahead.jquery.js
[typeahead.bundle.js]: http://twitter.github.com/typeahead.js/releases/latest/typeahead.bundle.js
[typeahead.bundle.min.js]: http://twitter.github.com/typeahead.js/releases/latest/typeahead.bundle.min.js
[jQuery]: http://jquery.com/

Documentation 
-------------

* [Typeahead Docs]
* [Bloodhound Docs]

[Typeahead Docs]: https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
[Bloodhound Docs]: https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md

Examples
--------

For some working examples of typeahead.js, visit the [examples page].

<!-- section links -->

[examples page]: http://twitter.github.io/typeahead.js/examples

Browser Support
---------------

* Chrome
* Firefox 3.5+
* Safari 4+
* Internet Explorer 8+
* Opera 11+

**NOTE:** typeahead.js is not tested on mobile browsers.

Customer Support
----------------

For general questions about typeahead.js, tweet at [@typeahead].

For technical questions, you should post a question on [Stack Overflow] and tag 
it with [typeahead.js][so tag].

<!-- section links -->

[Stack Overflow]: http://stackoverflow.com/
[@typeahead]: https://twitter.com/typeahead
[so tag]: http://stackoverflow.com/questions/tagged/typeahead.js

Issues
------

Discovered a bug? Please create an issue here on GitHub!

https://github.com/twitter/typeahead.js/issues

Versioning
----------

For transparency and insight into our release cycle, releases will be numbered 
with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backwards compatibility bumps the major
* New additions without breaking backwards compatibility bumps the minor
* Bug fixes and misc changes bump the patch

For more information on semantic versioning, please visit http://semver.org/.

Testing
-------

Tests are written using [Jasmine] and ran with [Karma]. To run
the test suite with PhantomJS, run `$ npm test`.

<!-- section links -->

[Jasmine]: http://jasmine.github.io/
[Karma]: http://karma-runner.github.io/

Developers
----------

If you plan on contributing to typeahead.js, be sure to read the 
[contributing guidelines]. A good starting place for new contributors are issues
labeled with [entry-level]. Entry-level issues tend to require minor changes 
and provide developers a chance to get more familiar with typeahead.js before
taking on more challenging work.

In order to build and test typeahead.js, you'll need to install its dev 
dependencies (`$ npm install`) and have [grunt-cli] 
installed (`$ npm install -g grunt-cli`). Below is an overview of the available 
Grunt tasks that'll be useful in development.

* `grunt build` – Builds *typeahead.js* from source.
* `grunt lint` – Runs source and test files through JSHint.
* `grunt watch` – Rebuilds *typeahead.js* whenever a source file is modified.
* `grunt server` – Serves files from the root of typeahead.js on localhost:8888. 
  Useful for using *test/playground.html* for debugging/testing.
* `grunt dev` – Runs `grunt watch` and `grunt server` in parallel.

<!-- section links -->

[contributing guidelines]: https://github.com/twitter/typeahead.js/blob/master/CONTRIBUTING.md
[entry-level]: https://github.com/twitter/typeahead.js/issues?&labels=entry-level&state=open
[grunt-cli]: https://github.com/gruntjs/grunt-cli

Maintainers
-----------

* **Jake Harding** 
  * [@JakeHarding](https://twitter.com/JakeHarding) 
  * [GitHub](https://github.com/jharding)

* **You?**

Authors
-------

* **Jake Harding** 
  * [@JakeHarding](https://twitter.com/JakeHarding) 
  * [GitHub](https://github.com/jharding)

* **Veljko Skarich**
  * [@vskarich](https://twitter.com/vskarich) 
  * [GitHub](https://github.com/vskarich)

* **Tim Trueman**
  * [@timtrueman](https://twitter.com/timtrueman) 
  * [GitHub](https://github.com/timtrueman)

License
-------

Copyright 2013 Twitter, Inc.

Licensed under the MIT License
