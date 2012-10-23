var template = require('../lib/uri-template'),
    expect = require("expect.js"),
    spec_examples = require('./data/spec-examples.json');

function createTestContext(c) {
    return function (t, r) {
        expect(template(t)(c)).to.eql(r);
    };
}

describe('uri-template', function () {
    describe('Level 1', function () {
        var assert = createTestContext({
                'var': 'value',
                'foo': 'bar',
                'hello': 'Hello World!',
                'bool': false
            });

        it('empty string', function () {
            assert('', '');
        });

        it('encodes non expressions correctly', function () {
            assert('hello/world', 'hello/world');
            assert('Hello World!/{foo}', 'Hello%20World!/bar');
        });

        it('expand plain ASCII strings', function () {
            assert('{var}', 'value');
        });

        it('expand multiple values', function () {
            assert('{var}/{foo}', 'value/bar');
        });

        it('escape invalid characters correctly', function () {
            assert('{hello}', 'Hello%20World!');
        });

        it('handles boolean values', function () {
            assert('{bool}', 'false');
        });
    });

    describe('Level 2', function () {
        var assert = createTestContext({
                'var': 'value',
                'hello': 'Hello World!',
                'path': '/foo/bar'
            });

        it('reserved expansion of basic strings', function () {
            assert('{+var}', 'value');
            assert('{+hello}', 'Hello%20World!');
        });

        it('preserves paths', function() {
            assert('{+path}/here', '/foo/bar/here');
            assert('here?ref={+path}', 'here?ref=/foo/bar');
        });
    });

    describe('Level 3', function () {
        var assert = createTestContext({
               'var' : 'value',
               'hello' : 'Hello World!',
               'empty' : '',
               'path' : '/foo/bar',
               'x' : '1024',
               'y' : '768'
            });

        it('variables without an operator', function () {
            assert('map?{x,y}', 'map?1024,768');
            assert('{x,hello,y}', '1024,Hello%20World!,768');
        });

        it('variables with the reserved expansion operator', function () {
            assert('{+x,hello,y}', '1024,Hello%20World!,768');
            assert('{+path,x}/here', '/foo/bar,1024/here');
        });

        it('variables with the fragment expansion operator', function () {
            assert('{#x,hello,y}', '#1024,Hello%20World!,768');
            assert('{#path,x}/here', '#/foo/bar,1024/here');
        });

        it('variables with the dot operator', function () {
            assert('X{.var}', 'X.value');
            assert('X{.x,y}', 'X.1024.768');
        });

        it('variables with the path operator', function () {
            assert('{/var}', '/value');
            assert('{/var,x}/here', '/value/1024/here');
        });

        it('variables with the parameter operator', function () {
            assert('{;x,y}', ';x=1024;y=768');
            assert('{;x,y,empty}', ';x=1024;y=768;empty');
        });

        it('variables with the query operator', function () {
            assert('{?x,y}', '?x=1024&y=768');
            assert('{?x,y,empty}', '?x=1024&y=768&empty=');
        });

        it('variables with the query continuation operator', function () {
            assert('?fixed=yes{&x}', '?fixed=yes&x=1024');
            assert('{&x,y,empty}', '&x=1024&y=768&empty=');
        });
    });

    describe('Level 4', function () {
        var assert = createTestContext({
                'var': 'value',
                'hello': 'Hello World!',
                'path': '/foo/bar',
                'list': ['red', 'green', 'blue'],
                'keys': {
                    'semi': ';',
                    'dot': '.',
                    'comma': ','
                },
                'number': 2133
            });

        it('variable modifiers prefix', function () {
            assert('{var:3}', 'val');
            assert('{var:30}', 'value');
            assert('{+path:6}/here', '/foo/b/here');
            assert('{#path:6}/here', '#/foo/b/here');
            assert('X{.var:3}', 'X.val');
            assert('{/var:1,var}', '/v/value');
            assert('{;hello:5}', ';hello=Hello');
            assert('{?var:3}', '?var=val');
            assert('{&var:3}', '&var=val');
        });

        it('variable modifier prefix converted to string', function () {
            assert('{number:3}', '213');
        });

        it('variable list expansion', function () {
            assert('{list}', 'red,green,blue');
            assert('{+list}', 'red,green,blue');
            assert('{#list}', '#red,green,blue');
            assert('{/list}', '/red,green,blue');
            assert('{;list}', ';list=red,green,blue');
            assert('{.list}', '.red,green,blue');
            assert('{?list}', '?list=red,green,blue');
            assert('{&list}', '&list=red,green,blue');
        });

        it('variable associative array expansion', function () {
            assert('{keys}', 'semi,%3B,dot,.,comma,%2C');
            assert('{keys*}', 'semi=%3B,dot=.,comma=%2C');
            assert('{+keys}', 'semi,;,dot,.,comma,,');
            assert('{#keys}', '#semi,;,dot,.,comma,,');
            assert('{.keys}', '.semi,%3B,dot,.,comma,%2C');
            assert('{/keys}', '/semi,%3B,dot,.,comma,%2C');
            assert('{;keys}', ';keys=semi,%3B,dot,.,comma,%2C');
            assert('{?keys}', '?keys=semi,%3B,dot,.,comma,%2C');
            assert('{&keys}', '&keys=semi,%3B,dot,.,comma,%2C');
        });

        it('variable list explode', function () {
            assert('{list*}', 'red,green,blue');
            assert('{+list*}', 'red,green,blue');
            assert('{#list*}', '#red,green,blue');
            assert('{/list*}', '/red/green/blue');
            assert('{;list*}', ';list=red;list=green;list=blue');
            assert('{.list*}', '.red.green.blue');
            assert('{?list*}', '?list=red&list=green&list=blue');
            assert('{&list*}', '&list=red&list=green&list=blue');

            assert('{/list*,path:4}', '/red/green/blue/%2Ffoo');
        });

        it('variable associative array explode', function () {
            assert('{+keys*}', 'semi=;,dot=.,comma=,');
            assert('{#keys*}', '#semi=;,dot=.,comma=,');
            assert('{/keys*}', '/semi=%3B/dot=./comma=%2C');
            assert('{;keys*}', ';semi=%3B;dot=.;comma=%2C');
            assert('{?keys*}', '?semi=%3B&dot=.&comma=%2C');
            assert('{&keys*}', '&semi=%3B&dot=.&comma=%2C')
        });
    });
});
