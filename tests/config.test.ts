import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('loadConfig', () => {
  it('resolves default paths from the project root', () => {
    const config = loadConfig({});

    expect(config.contentDir).toBe(path.join(projectRoot, 'src/content'));
    expect(config.templatePath).toBe(path.join(projectRoot, 'src/render/template.html'));
    expect(config.publicDir).toBe(path.join(projectRoot, 'public'));
  });

  it('resolves relative overrides from the project root', () => {
    const config = loadConfig({
      CONTENT_DIR: 'fixtures/content',
      TEMPLATE_PATH: 'fixtures/template.html',
      PUBLIC_DIR: 'fixtures/public',
    });

    expect(config.contentDir).toBe(path.join(projectRoot, 'fixtures/content'));
    expect(config.templatePath).toBe(path.join(projectRoot, 'fixtures/template.html'));
    expect(config.publicDir).toBe(path.join(projectRoot, 'fixtures/public'));
  });

  it('rejects an invalid port', () => {
    expect(() => loadConfig({ PORT: 'invalid' })).toThrow('Invalid PORT');
  });
});
