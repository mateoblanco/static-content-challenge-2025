import { readFileSync } from 'node:fs';

export type Layout = (content: string) => string;

export const loadTemplate = (templatePath: string): Layout => {
  const template = readFileSync(templatePath, 'utf8');
  if (!template.includes('{{content}}')) {
    throw new Error(`Template ${templatePath} has no {{content}} placeholder`);
  }
  return (content) => template.replace('{{content}}', () => content);
}