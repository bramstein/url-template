import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseTemplate } from 'url-template';

function createTestContext(context) {
  return (template, result) => {
    assert.equal(parseTemplate(template).expand(context), result);
  };
}

describe('uri-template', () => {
  describe('Level 1', () => {
    const assert = createTestContext({
      'var': 'value',
      'some.value': 'some',
      'some_value': 'value',
      'Some%20Thing': 'hello',
      'foo': 'bar',
      'hello': 'Hello World!',
      'bool': false,
      'toString': 'string',
      'number': 42,
      'float': 3.14,
      'undef': undefined,
      'null': null,
      'chars': 'šöäŸœñê€£¥‡ÑÒÓÔÕÖ×ØÙÚàáâãäåæçÿü',
      'surrogatepairs': '\uD834\uDF06'
    });

    test('empty string', () => {
      assert('', '');
    });

    test('encodes non expressions correctly', () => {
      assert('hello/world', 'hello/world');
      assert('Hello World!/{foo}', 'Hello%20World!/bar');
      assert(':/?#[]@!$&()*+,;=\'', ':/?#[]@!$&()*+,;=\'');
      assert('%20', '%20');
      assert('%xyz', '%25xyz');
      assert('%', '%25');
    });

    test('expand plain ASCII strings', () => {
      assert('{var}', 'value');
    });

    test('expand non-ASCII strings', () => {
      assert('{chars}', '%C5%A1%C3%B6%C3%A4%C5%B8%C5%93%C3%B1%C3%AA%E2%82%AC%C2%A3%C2%A5%E2%80%A1%C3%91%C3%92%C3%93%C3%94%C3%95%C3%96%C3%97%C3%98%C3%99%C3%9A%C3%A0%C3%A1%C3%A2%C3%A3%C3%A4%C3%A5%C3%A6%C3%A7%C3%BF%C3%BC');
    });

    test('expands and encodes surrogate pairs correctly', () => {
      assert('{surrogatepairs}', '%F0%9D%8C%86');
    });

    test('expand expressions with dot and underscore', () => {
      assert('{some.value}', 'some');
      assert('{some_value}', 'value');
    });

    test('expand expressions with encoding', () => {
      assert('{Some%20Thing}', 'hello');
    });

    test('expand expressions with reserved JavaScript names', () => {
      assert('{toString}', 'string');
    });

    test('expand variables that are not strings', () => {
      assert('{number}', '42');
      assert('{float}', '3.14');
      assert('{bool}', 'false');
    });

    test('expand variables that are undefined or null', () => {
      assert('{undef}', '');
      assert('{null}', '');
    });

    test('expand multiple values', () => {
      assert('{var}/{foo}', 'value/bar');
    });

    test('escape invalid characters correctly', () => {
      assert('{hello}', 'Hello%20World%21');
    });
  });

  describe('Level 2', () => {
    const assert = createTestContext({
      'var': 'value',
      'hello': 'Hello World!',
      'path': '/foo/bar'
    });

    test('reserved expansion of basic strings', () => {
      assert('{+var}', 'value');
      assert('{+hello}', 'Hello%20World!');
    });

    test('preserves paths', () => {
      assert('{+path}/here', '/foo/bar/here');
      assert('here?ref={+path}', 'here?ref=/foo/bar');
    });
  });

  describe('Level 3', () => {
    const assert = createTestContext({
      'var' : 'value',
      'hello' : 'Hello World!',
      'empty' : '',
      'path' : '/foo/bar',
      'x' : '1024',
      'y' : '768'
    });

    test('variables without an operator', () => {
      assert('map?{x,y}', 'map?1024,768');
      assert('{x,hello,y}', '1024,Hello%20World%21,768');
    });

    test('variables with the reserved expansion operator', () => {
      assert('{+x,hello,y}', '1024,Hello%20World!,768');
      assert('{+path,x}/here', '/foo/bar,1024/here');
    });

    test('variables with the fragment expansion operator', () => {
      assert('{#x,hello,y}', '#1024,Hello%20World!,768');
      assert('{#path,x}/here', '#/foo/bar,1024/here');
    });

    test('variables with the dot operator', () => {
      assert('X{.var}', 'X.value');
      assert('X{.x,y}', 'X.1024.768');
    });

    test('variables with the path operator', () => {
      assert('{/var}', '/value');
      assert('{/var,x}/here', '/value/1024/here');
    });

    test('variables with the parameter operator', () => {
      assert('{;x,y}', ';x=1024;y=768');
      assert('{;x,y,empty}', ';x=1024;y=768;empty');
    });

    test('variables with the query operator', () => {
      assert('{?x,y}', '?x=1024&y=768');
      assert('{?x,y,empty}', '?x=1024&y=768&empty=');
    });

    test('variables with the query continuation operator', () => {
      assert('?fixed=yes{&x}', '?fixed=yes&x=1024');
      assert('{&x,y,empty}', '&x=1024&y=768&empty=');
    });
  });

  describe('Level 4', () => {
    const assert = createTestContext({
      'var': 'value',
      'hello': 'Hello World!',
      'path': '/foo/bar',
      'list': ['red', 'green', 'blue'],
      'keys': {
        'semi': ';',
        'dot': '.',
        'comma': ','
      },
      "chars": {
        'ü': 'ü'
      },
      'number': 2133,
      'emptystring': '',
      'emptylist': [],
      'emptyobject': {},
      'undefinedlistitem': [1,,2],
      'undefinedobjectitem': { key: null, hello: 'world', 'empty': '', '': 'nothing' }
    });

    test('variable empty list', () => {
      assert('{/emptylist}', '');
      assert('{/emptylist*}', '');
      assert('{?emptylist}', '?emptylist=');
      assert('{?emptylist*}', '');
    });

    test('variable empty object', () => {
      assert('{/emptyobject}', '');
      assert('{/emptyobject*}', '');
      assert('{?emptyobject}', '?emptyobject=');
      assert('{?emptyobject*}', '');
    });

    test('variable undefined list item', () => {
      assert('{undefinedlistitem}', '1,2');
      assert('{undefinedlistitem*}', '1,2');
      assert('{?undefinedlistitem*}', '?undefinedlistitem=1&undefinedlistitem=2');
    });

    test('variable undefined object item', () => {
      assert('{undefinedobjectitem}', 'hello,world,empty,,,nothing');
      assert('{undefinedobjectitem*}', 'hello=world,empty=,nothing');
    });

    test('variable empty string', () => {
      assert('{emptystring}', '');
      assert('{+emptystring}', '');
      assert('{#emptystring}', '#');
      assert('{.emptystring}', '.');
      assert('{/emptystring}', '/');
      assert('{;emptystring}', ';emptystring');
      assert('{?emptystring}', '?emptystring=');
      assert('{&emptystring}', '&emptystring=');
    });

    test('variable modifiers prefix', () => {
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

    test('variable modifier prefix converted to string', () => {
      assert('{number:3}', '213');
    });

    test('variable list expansion', () => {
      assert('{list}', 'red,green,blue');
      assert('{+list}', 'red,green,blue');
      assert('{#list}', '#red,green,blue');
      assert('{/list}', '/red,green,blue');
      assert('{;list}', ';list=red,green,blue');
      assert('{.list}', '.red,green,blue');
      assert('{?list}', '?list=red,green,blue');
      assert('{&list}', '&list=red,green,blue');
    });

    test('variable associative array expansion', () => {
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

    test('variable list explode', () => {
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

    test('variable associative array explode', () => {
      assert('{+keys*}', 'semi=;,dot=.,comma=,');
      assert('{#keys*}', '#semi=;,dot=.,comma=,');
      assert('{/keys*}', '/semi=%3B/dot=./comma=%2C');
      assert('{;keys*}', ';semi=%3B;dot=.;comma=%2C');
      assert('{?keys*}', '?semi=%3B&dot=.&comma=%2C');
      assert('{&keys*}', '&semi=%3B&dot=.&comma=%2C')
    });

    test('encodes associative arrays correctly', () => {
      assert('{chars*}', '%C3%BC=%C3%BC');
    });
  });

  describe('Encoding', () => {
    const assert = createTestContext({
      restricted: ":/?#[]@!$&()*+,;='",
      percent: '%',
      encoded: '%25',
      'pctencoded%20name': '',
      mapWithEncodedName: {
        'encoded%20name': ''
      },
      mapWithRestrictedName: {
        'restricted=name': ''
      },
      mapWidthUmlautName: {
        'ümlaut': ''
      }
    });

    test('passes through percent encoded values', () => {
      assert('{percent}', '%25');
      assert('{+encoded}', '%25');
    });

    test('encodes restricted characters correctly', () => {
      assert('{restricted}', '%3A%2F%3F%23%5B%5D%40%21%24%26%28%29%2A%2B%2C%3B%3D%27');
      assert('{+restricted}', ':/?#[]@!$&()*+,;=\'');
      assert('{#restricted}', '#:/?#[]@!$&()*+,;=\'');
      assert('{/restricted}', '/%3A%2F%3F%23%5B%5D%40%21%24%26%28%29%2A%2B%2C%3B%3D%27');
      assert('{;restricted}', ';restricted=%3A%2F%3F%23%5B%5D%40%21%24%26%28%29%2A%2B%2C%3B%3D%27');
      assert('{.restricted}', '.%3A%2F%3F%23%5B%5D%40%21%24%26%28%29%2A%2B%2C%3B%3D%27');
      assert('{?restricted}', '?restricted=%3A%2F%3F%23%5B%5D%40%21%24%26%28%29%2A%2B%2C%3B%3D%27');
      assert('{&restricted}', '&restricted=%3A%2F%3F%23%5B%5D%40%21%24%26%28%29%2A%2B%2C%3B%3D%27');
    });
  });

  describe('Error handling (or the lack thereof)', () => {
    const assert = createTestContext({
      foo: 'test',
      keys: {
        foo: 'bar'
      }
    });

    test('does not expand invalid expressions', () => {
      assert('{test', '{test');
      assert('test}', 'test}');
      assert('{{test}}', '{}'); // TODO: Is this acceptable?
    });

    test('does not expand with incorrect operators', () => {
      assert('{@foo}', ''); // TODO: This will try to match a variable called `@foo` which will fail because it is not in our context. We could catch this by ignoring reserved operators?
      assert('{$foo}', ''); // TODO: Same story, but $ is not a reserved operator.
      assert('{++foo}', '');
    });

    test('ignores incorrect prefixes', () => {
      assert('{foo:test}', 'test'); // TODO: Invalid prefixes are ignored. We could throw an error.
      assert('{foo:2test}', 'te'); // TODO: Best effort is OK?
    });

    test('prefix applied to the wrong context', () => {
      assert('{keys:1}', 'foo,bar');
    });
  });

  describe('Skipping undefined arguments', () => {
    const assert = createTestContext({
      'var': 'value',
      'number': 2133,
      'emptystring': '',
      'emptylist': [],
      'emptyobject': {},
      'undefinedlistitem': [1,,2],
    });

    test('variable undefined list item', () => {
      assert('{undefinedlistitem}', '1,2');
      assert('{undefinedlistitem*}', '1,2');
      assert('{?undefinedlistitem*}', '?undefinedlistitem=1&undefinedlistitem=2');
    });

    test('query with empty/undefined arguments', () => {
      assert('{?var,number}', '?var=value&number=2133');
      assert('{?undef}', '');
      assert('{?emptystring}', '?emptystring=');
      assert('{?emptylist}', '?emptylist=');
      assert('{?emptyobject}', '?emptyobject=');
      assert('{?undef,var,emptystring}', '?var=value&emptystring=');
    });
  });
});
