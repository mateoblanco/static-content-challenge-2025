import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { renderPage, renderNotFound, renderServerError } from './render.js';

export interface AppConfig {
  contentDir: string;
  templatePath: string;
}

const inject = (template: string, content: string) =>{
  return template.replace('{{content}}', () => content);
}

export const createApp = ({ contentDir, templatePath }: AppConfig) => {
  const app = express();
  const root = path.resolve(contentDir);
  const template = readFileSync(templatePath, 'utf8');

  const sendHtml = (res: Response, status: number, body: string) =>{
    res.status(status).type('html').send(inject(template, body));
  }

  app.get('/{*splat}', async (req, res) => {
    const segments = ((req.params.splat as string[] | undefined) ?? []).filter(Boolean);

    // Trailing slash: redirigir a la URL canónica (conservando ?utm_... de marketing)
    if (req.path.length > 1 && req.path.endsWith('/')) {
      const q = req.originalUrl.includes('?')
        ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
        : '';
      res.redirect(301, '/' + segments.map(encodeURIComponent).join('/') + q);
      return;
    }

    // Input inválido o intento de salir de contentDir -> 404
    const dir = path.resolve(root, ...segments);
    const escapes = dir !== root && !dir.startsWith(root + path.sep);
    if (escapes || segments.some((s) => s.includes('\0'))) {
      sendHtml(res, 404, renderNotFound());
      return;
    }

    try {
      const md = await readFile(path.join(dir, 'index.md'), 'utf8');
      sendHtml(res, 200, renderPage(md));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT' || code === 'ENOTDIR') {
        sendHtml(res, 404, renderNotFound());
        return;
      }
      throw err;
    }
  });

  // Manejador de errores: siempre al final, y con 4 parámetros
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    console.error(err);
    sendHtml(res, 500, renderServerError());
  });

  return app;
}