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
  const publicDir = path.join(root, 'public');

  await writeFile(templatePath, '<!doctype html><html><body>{{content}}</body></html>');

  await mkdir(path.join(contentDir, 'about'), { recursive: true });
  await writeFile(
    path.join(contentDir, 'about', 'index.md'),
    '# About us\n\nLearn about our company.',
  );
  await mkdir(path.join(contentDir, 'blog', 'june', 'company-update'), { recursive: true });
  await writeFile(
    path.join(contentDir, 'blog', 'june', 'company-update', 'index.md'),
    '# Company update',
  );
  await mkdir(path.join(contentDir, 'release #1'), { recursive: true });
  await writeFile(path.join(contentDir, 'release #1', 'index.md'), '# Release #1');
  await mkdir(path.join(contentDir, 'assets'), { recursive: true });
  await writeFile(path.join(contentDir, 'assets', 'index.md'), '# Assets page');
  await mkdir(path.join(contentDir, 'static'), { recursive: true });
  await writeFile(path.join(contentDir, 'static', 'index.md'), '# Static content page');
  await mkdir(path.join(contentDir, 'static', 'collision'), { recursive: true });
  await writeFile(path.join(contentDir, 'static', 'collision', 'index.md'), '# Content wins');
  await mkdir(path.join(publicDir, 'assets'), { recursive: true });
  await writeFile(path.join(publicDir, 'assets', 'icon.svg'), '<svg></svg>');
  await writeFile(path.join(publicDir, 'collision'), 'public file');

  app = createApp({ contentDir, templatePath, publicDir });
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

  it('does not upgrade local HTTP requests to HTTPS outside production', async () => {
    const res = await request(app).get('/about');

    expect(res.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');
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

describe('content index', () => {
  it('shows the first line of each content file', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      '<p class="home-list-item-preview">Learn about our company.</p>',
    );
    expect(res.text).not.toContain('<p class="home-list-item-preview"># About us</p>');
  });

  it('encodes special characters in page URLs', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('href="/release%20%231"');
    expect(res.text).toContain('>release #1</a>');
  });

  it('serves the encoded URL generated for a page with special characters', async () => {
    const res = await request(app).get('/release%20%231');

    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>Release #1</h1>');
  });
});

describe('GET a URL that does not match any content', () => {
  it('returns 404', async () => {
    const res = await request(app).get('/no-existe');
    expect(res.status).toBe(404);
  });
});

describe('canonical URLs', () => {
  it('redirects to the URL without the trailing slash, preserving the query string', async () => {
    const res = await request(app).get('/about/?utm_source=test');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/about?utm_source=test');
  });

  it('redirects duplicate slashes to the canonical URL', async () => {
    const res = await request(app).get('/blog//june/company-update?source=test').redirects(0);

    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/blog/june/company-update?source=test');
  });
});

describe('static assets', () => {
  it('serves public files as a fallback under /static', async () => {
    const res = await request(app).get('/static/assets/icon.svg');

    expect(res.status).toBe(200);
    expect(res.type).toBe('image/svg+xml');
  });

  it('does not redirect requests for public directories', async () => {
    const res = await request(app).get('/static/assets').redirects(0);

    expect(res.status).toBe(404);
    expect(res.headers.location).toBeUndefined();
  });

  it('does not let public directory names shadow content pages', async () => {
    const res = await request(app).get('/assets');

    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>Assets page</h1>');
  });

  it('allows a content page to use the static path', async () => {
    const res = await request(app).get('/static');

    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>Static content page</h1>');
  });

  it('gives content precedence over a public file at the same URL', async () => {
    const res = await request(app).get('/static/collision');

    expect(res.status).toBe(200);
    expect(res.text).toContain('<h1>Content wins</h1>');
    expect(res.text).not.toContain('public file');
  });
});

describe('invalid content paths', () => {
  it('returns 404 for a null byte', async () => {
    const res = await request(app).get('/%00');

    expect(res.status).toBe(404);
  });

  it('does not treat an encoded slash as a folder separator', async () => {
    const res = await request(app).get('/blog%2Fjune%2Fcompany-update');

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
