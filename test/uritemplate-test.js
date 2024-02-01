import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseTemplate } from 'url-template';
import examples from '../uritemplate-test/spec-examples-by-section.json' assert { type: 'json' };

function createTestContext(context) {
  return (template, result) => {
    if (typeof result === 'string') {
      assert.equal(parseTemplate(template).expand(context), result);
    } else {
      assert.ok(result.includes(parseTemplate(template).expand(context)));
    }
  };
}

describe('spec-examples', () => {
  for (const [section, example] of Object.entries(examples)) {
    const assert = createTestContext(example.variables);

    for (const [template, result] of example.testcases) {
      test(`${section} ${template}`, () => assert(template, result));
    }
  }
});
