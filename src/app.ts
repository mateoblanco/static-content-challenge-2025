import express from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

export interface AppConfig {
  contentDir: string;
  templatePath: string;
}

const escapeHtml = (s: string) =>{
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
  
const inject = (template: string, content: string) =>{
    return template.replace('{{content}}', () => content);
}

export function createApp({ contentDir, templatePath }: AppConfig) {
  const app = express();
  const root = path.resolve(contentDir);
  const template = readFileSync(templatePath, 'utf8');


  app.get('/{*splat}', async (req, res) => {
    const segments = (req.params.splat as string[] | undefined) ?? [];

    const dir = path.resolve(root, ...segments);

    if (dir !== root && !dir.startsWith(root + path.sep)) {
      res.status(404).send('Not found');
      return;
    }

    try {
      const md = await readFile(path.join(dir, 'index.md'), 'utf8');
      const html = inject(template, `<pre>${escapeHtml(md)}</pre>`);
      res.type('html').send(html); 
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT' || code === 'ENOTDIR') {
        res.status(404).send('Not found');
        return;
      }
      throw err;
    }
  });

  return app;
}