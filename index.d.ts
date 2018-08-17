// Type definitions for @reverbdotcom/url-template
// Project: https://github.com/reverbdotcom/url-template

export namespace urltemplate;

interface BaseContext {
  [key: string]: any;
}

export interface ParsedTemplate<T> {
  expand: (context: T) => string;
}

export function parse<T extends BaseContext = BaseContext>(template: string): ParsedTemplate<T>;

