import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveContentDir } from '../src/helpers/resolveContentPath.js';

const root = path.resolve('/content');
const invalidSegments: Array<[description: string, segments: string[]]> = [
  ['parent traversal', ['..', 'secret']],
  ['nested traversal', ['safe', '..', '..', 'secret']],
  ['hidden segment', ['.git']],
  ['null byte', ['page\0name']],
  ['encoded forward slash after URL decoding', ['blog/june']],
  ['backslash separator', ['blog\\june']],
];

describe('resolveContentDir', () => {
  it('resolves valid nested segments inside the content root', () => {
    expect(resolveContentDir(root, ['blog', 'june', 'company-update']))
      .toBe(path.join(root, 'blog', 'june', 'company-update'));
  });

  it.each(invalidSegments)('rejects %s', (_description, segments) => {
    expect(resolveContentDir(root, segments)).toBeNull();
  });
});
