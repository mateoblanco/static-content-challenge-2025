import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../src/app.js';

let root: string;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'static-content-'));

  const contentDir = path.join(root, 'content');
  const templatePath = path.join(root, 'template.html');

  await writeFile(templatePath, '<!doctype html><html><body>{{content}}</body></html>');

  await mkdir(path.join(contentDir, 'about'), { recursive: true });
  await writeFile(path.join(contentDir, 'about', 'index.md'), '# About us');
  await mkdir(path.join(contentDir, 'blog', 'june', 'company-update'), { recursive: true });
  await writeFile(
    path.join(contentDir, 'blog', 'june', 'company-update', 'index.md'),
    '# Company update',
  );
  await writeFile(path.join(root, 'secret.txt'), 'confidential content');

  app = createApp({ contentDir, templatePath, publicDir: path.join(root, 'public') });
});

afterAll(() => rm(root, { recursive: true, force: true }));

describe('GET valid URL', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/about');
    expect(res.status).toBe(200);
  });

  it('returns the HTML generated from index.md', async () => {
    const res = await request(app).get('/about');
    expect(res.text).toContain('<h1>About us</h1>');
    expect(res.text).not.toContain('{{content}}');
  });
});

describe('hot content addition', () => {
  it('serves a folder created after the app is already running', async () => {
    const contentDir = path.join(root, 'content');

    await mkdir(path.join(contentDir, 'new-page'), { recursive: true });
    await writeFile(path.join(contentDir, 'new-page', 'index.md'), '# New page');

    const res = await request(app).get('/new-page');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>New page</h1>');
  });
});

describe('GET a URL that does not match any content', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
  });
});

describe('trailing slash', () => {
  it('redirects to the URL without the trailing slash, preserving the query string', async () => {
    const res = await request(app).get('/about/?utm_source=test');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/about?utm_source=test');
  });
});

describe('path traversal attempts', () => {
  it('returns 404 for ../ encoded, without exposing the file', async () => {
    const res = await request(app).get('/%2e%2e/secret.txt');
    expect(res.status).toBe(404);
    expect(res.text).not.toContain('confidential content');
  });

  it('returns 404 for ../ without encoding', async () => {
    const res = await request(app)
      .get('/about/../../secret.txt')
      .redirects(0);
    expect(res.status).toBe(404);
  });
});

describe('nested routes', () => {
  it('resolves a folder with multiple levels', async () => {
    const res = await request(app).get('/blog/june/company-update');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>Company update</h1>');
  });
});

describe('folder without its own index.md', () => {
  it('returns 404 for an intermediate folder', async () => {
    const res = await request(app).get('/blog');
    expect(res.status).toBe(404);
  });
});

describe('symlinks escaping contentDir', () => {
  it('returns 404 if index.md is a symlink outside of contentDir', async () => {
    const contentDir = path.join(root, 'content');
    const outsideFile = path.join(root, 'outside.txt');
    await writeFile(outsideFile, 'outside of contentDir');

    await mkdir(path.join(contentDir, 'leak'), { recursive: true });

    const { symlink } = await import('node:fs/promises');
    await symlink(outsideFile, path.join(contentDir, 'leak', 'index.md'));

    const res = await request(app).get('/leak');
    expect(res.status).toBe(404);
    expect(res.text).not.toContain('outside of contentDir');
  });
});

describe('4xx errors', () => {
  it('shows a different message for 400 than for 404', async () => {
    const badRequest = await request(app).get('/%E0%A4%A');
    expect(badRequest.status).toBe(400);
    expect(badRequest.text).toContain('Bad request');

    const notFound = await request(app).get('/no-existe');
    expect(notFound.status).toBe(404);
    expect(notFound.text).toContain('Page not found');
  });
});