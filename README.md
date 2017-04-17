## A JavaScript URI template implementation

This is a simple URI template implementation following the [RFC 6570 URI Template specification](http://tools.ietf.org/html/rfc6570). The implementation supports all levels defined in the specification and is extensively tested.

## Installation

For use with Node.js you can install it through npm:

```sh
$ npm install url-template
```

If you want to use it in a browser, copy `lib/url-template.js` into your project and use the global `urltemplate` instance. Alternatively you can use [Bower](http://bower.io/) to install this package:

```sh
$ bower install url-template
```

## Example

```js
var template = require('url-template');

var emailUrlTemplate = template.parse('/{email}/{folder}/{id}');
var emailUrl = emailUrlTemplate.expand({
  email: 'user@domain',
  folder: 'test',
  id: 42
});

console.log(emailUrl);
// Returns '/user@domain/test/42'
```

### Config files

A common pattern in config files is to have a bunch of configuration settings and a URL template that are all used together. For example, a YAML file might contain:

```yaml
database:
  path:
    driver: postgres
    database: mydb
    username: postgres
    password: blah
    host: localhost
    _: {driver}://{username}:{password}@{host}/{database}
```

If a template object is created with no initial URI template then the `expand` method will look for a template in the context:

    var template = require('url-template');

    ...

    var emailUrl = template.parse();

    // Returns '/user@domain/test/42'
    emailUrl.expand({
      email: 'user@domain',
      folder: 'test',
      id: 42,
      _: '/{email}/{folder}/{id}'
    });

## A note on error handling and reporting

The RFC states that errors in the templates could optionally be handled and reported to the user. This implementation takes a slightly different approach in that it tries to do a best effort template expansion and leaves erroneous expressions in the returned URI instead of throwing errors. So for example, the incorrect expression `{unclosed` will return `{unclosed` as output. The leaves incorrect URLs to be handled by your URL library of choice.
