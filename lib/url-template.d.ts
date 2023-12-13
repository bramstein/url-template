export type PrimitiveValue = string | number | boolean | null;

export interface Template {
  expand(context: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue | PrimitiveValue[]>>): string;
}

export function parseTemplate(template: string): Template;
