import { createRequire } from 'node:module';
import { fileURLToPath as fromURL } from 'node:url';
import { expect } from 'chai';
import { parseTemplate } from '../lib/url-template.js';

const require = createRequire(fromURL(import.meta.url));
const examples = require('../uritemplate-test/spec-examples-by-section.json');

function createTestContext(c) {
  return function (t, r) {
    if (typeof r === 'string') {
      expect(parseTemplate(t).expand(c)).to.eql(r);
    } else {
      expect(r.indexOf(parseTemplate(t).expand(c)) >= 0).to.be.true;
    }
  };
}

describe('spec-examples', function () {
  Object.keys(examples).forEach(function (section) {
    var assert = createTestContext(examples[section].variables);
    examples[section].testcases.forEach(function (testcase) {
      it(section + ' ' + testcase[0], function () {
        assert(testcase[0], testcase[1]);
      });
    });
  });
});
