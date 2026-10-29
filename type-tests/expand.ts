import { parseTemplate, type PrimitiveValue } from 'url-template';

const template = parseTemplate('{?value}');

function expandOptional(value?: string): string {
  return template.expand({ value });
}

const absent: PrimitiveValue = undefined;
template.expand({ value: absent });
template.expand({ value: undefined });
template.expand({ value: ['one', undefined, 'two'] });
template.expand({ value: { first: 'A', omitted: undefined, last: 'B' } });
template.expand({ value: { list: ['A', undefined, 'B'] } });

template.expand({ text: 'text', count: 0, flag: false, nullable: null, empty: '' });
template.expand({ value: ['one', null, 'two'] });
template.expand({ value: { first: 'A', omitted: null, last: 'B' } });
template.expand({ value: { list: ['A', null, 'B'] } });
template.expand({});
expandOptional();

// @ts-expect-error Functions are not supported values.
template.expand({ value: () => 'text' });
// @ts-expect-error Symbols are not supported values.
template.expand({ value: Symbol('text') });
// @ts-expect-error More deeply nested objects are not supported values.
template.expand({ value: { nested: { deeper: 'text' } } });
