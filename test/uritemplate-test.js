import { expect } from 'chai';
import { readFile } from 'fs/promises';
import template from '../lib/url-template.js';

const examples = JSON.parse(await readFile(new URL('../uritemplate-test/spec-examples-by-section.json', import.meta.url)));

function createTestContext(c) {
  return function (t, r) {
    if (typeof r === 'string') {
      expect(template.parse(t).expand(c)).to.eql(r);
    } else {
      expect(r.indexOf(template.parse(t).expand(c)) >= 0).to.be.true;
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
