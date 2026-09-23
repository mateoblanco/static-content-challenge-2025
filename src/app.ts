import express from 'express';
import path from 'node:path';
import type { AppConfig } from './config.js';
import { NotFoundError } from './errors.js';
import { loadMarkdown } from './helpers/loadPage.js';
import { renderPage } from './render/render.js';
import { loadTemplate } from './render/template.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';

export const createApp = ({ contentDir, templatePath, publicDir }: AppConfig) => {
  const app = express();
  const root = path.resolve(contentDir);
  const layout = loadTemplate(templatePath);

  app.use(helmet());
  app.use(express.static(publicDir, { index: false }));

  app.get('/{*splat}', async (req, res) => {
    const segments = ((req.params.splat as string[] | undefined) ?? []).filter(Boolean);

    if (req.path.length > 1 && req.path.endsWith('/')) {
      const i = req.originalUrl.indexOf('?');
      const query = i === -1 ? '' : req.originalUrl.slice(i);
      res.redirect(301, '/' + segments.map(encodeURIComponent).join('/') + query);
      return;
    }

    const markdown = await loadMarkdown(root, segments); // si no existe, lanza NotFoundError
    res.type('html').send(layout(renderPage(markdown)));
  });

  app.use((_req, _res, next) => next(new NotFoundError())); // lo que no matcheó (ej. un POST)
  app.use(errorHandler(layout));

  return app;
};