export type PrimitiveValue = string | number | boolean;

export interface Template {
  expand(context: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue>>): string;
}

export function parseTemplate(template: string): Template;
