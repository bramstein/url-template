export interface Template {
  expand(context: Record<string, string | number | boolean>): string;
}

export function parseTemplate(template: string): Template;
