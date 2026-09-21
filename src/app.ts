import express, { type Response } from 'express';
import path from 'node:path';
import type { AppConfig } from './config.js';
import { NotFoundError } from './errors.js';
import { loadMarkdown } from './helpers/loadPage.js';
import { renderNotFound, renderPage } from './render/render.js';
import { loadTemplate } from './render/template.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';

export const createApp = ({ contentDir, templatePath, publicDir }: AppConfig) => {
  const app = express();
  const root = path.resolve(contentDir);
  const layout = loadTemplate(templatePath);

  app.use(express.static(publicDir, { index: false }));

  const sendHtml = (res: Response, status: number, body: string) => {
   return res.status(status).type('html').send(layout(body));
  }


  app.use(helmet());

  app.get('/{*splat}', async (req, res) => {
    const segments = ((req.params.splat as string[] | undefined) ?? []).filter(Boolean);

    if (req.path.length > 1 && req.path.endsWith('/')) {
      const i = req.originalUrl.indexOf('?');
      const query = i === -1 ? '' : req.originalUrl.slice(i);
      res.redirect(301, '/' + segments.map(encodeURIComponent).join('/') + query);
      return;
    }

    try {
      const markdown = await loadMarkdown(root, segments);
      sendHtml(res, 200, renderPage(markdown));
    } catch (err) {
      if (err instanceof NotFoundError) {
        sendHtml(res, 404, renderNotFound());
        return;
      }
      throw err;
    }
  });

  app.use((_req, _res, next) => next(new NotFoundError()));

  app.use(errorHandler(layout));


  return app;
}