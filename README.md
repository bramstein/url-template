## A JavaScript URI template implementation

* RFC 6570 compatible
* simple
* fast

## Example

    var template = require('uri-template');

    ...

    var createUrl = template('/{email}/{folder}/{id}');

    var url = createUrl({
           user: 'user@domain',
           folder: 'test',
           id: 42
        });

    console.log(url); // '/user@domain/test/42'

