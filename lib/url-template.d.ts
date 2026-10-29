export type PrimitiveValue = string | number | boolean | null | undefined;

export interface Template {
  expand(context: Record<string, PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue | PrimitiveValue[]>>): string;
}

export function parseTemplate(template: string): Template;
