import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors.js';
import { renderBadRequest, renderNotFound, renderServerError } from '../render/render.js';
import type { Layout } from '../render/template.js';

const getStatus = (err: unknown): number => {
  if (err instanceof HttpError) return err.status;
  const status = (err as { status?: unknown }).status;
  return typeof status === 'number' && status >= 400 && status < 600 ? status : 500;
};

const renderBody = (status: number): string => {
  if (status >= 500) return renderServerError();
  if (status === 400) return renderBadRequest();
  return renderNotFound();
}

export function errorHandler(layout: Layout) {
  return (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }

    const status = getStatus(err);
    if (status >= 500) console.error(err);

    const body = renderBody(status);
    res.status(status).type('html').send(layout(body));
  };
}