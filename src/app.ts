import express from 'express';
import path from 'node:path';
import type { AppConfig } from './config.js';
import { NotFoundError } from './errors.js';
import { getContentPages, loadMarkdown } from './helpers/loadPage.js';
import { renderIndex, renderPage } from './render/render.js';
import { loadTemplate } from './render/template.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';

export const createApp = ({ contentDir, templatePath, publicDir }: AppConfig) => {
  const app = express();
  const root = path.resolve(contentDir);
  const layout = loadTemplate(templatePath);

  // Safari applies Helmet's `upgrade-insecure-requests` directive to
  // localhost too. This made it rewrite the CSS and page links from HTTP to
  // HTTPS even though the development server only speaks HTTP.
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production'
      ? undefined
      : { directives: { 'upgrade-insecure-requests': null } },
  }));

  app.get('/{*splat}', async (req, res, next) => {
    const segments = ((req.params.splat as string[] | undefined) ?? []).filter(Boolean);
    const canonicalPath = segments.length === 0
      ? '/'
      : '/' + segments.map(encodeURIComponent).join('/');

    if (req.path !== canonicalPath) {
      const i = req.originalUrl.indexOf('?');
      const query = i === -1 ? '' : req.originalUrl.slice(i);
      res.redirect(301, canonicalPath + query);
      return;
    }

    if (segments.length === 0) {
      const pages = await getContentPages(root);
      res.type('html').send(layout(renderIndex(pages)));
      return;
    }

    try {
      const markdown = await loadMarkdown(root, segments);
      res.type('html').send(layout(renderPage(markdown)));
    } catch (err) {
      // Content owns the URL namespace. Only fall back to application assets
      // when no content page exists at the requested /static path.
      if (err instanceof NotFoundError && segments[0] === 'static') {
        next();
        return;
      }
      throw err;
    }
  });

  app.use('/static', express.static(publicDir, { index: false, redirect: false }));

  app.use((_req, _res, next) => next(new NotFoundError()));
  app.use(errorHandler(layout));

  return app;
};
