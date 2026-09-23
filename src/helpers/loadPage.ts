import path from 'node:path';
import { constants } from 'node:fs';
import { open, readdir, realpath } from 'node:fs/promises';
import { NotFoundError } from '../errors.js';
import { resolveContentDir } from './resolveContentPath.js';

export const loadMarkdown = async (root: string, segments: string[]): Promise<string> => {
  const dir = resolveContentDir(root, segments);
  if (!dir) throw new NotFoundError();

  const filePath = path.join(dir, 'index.md');

  try {
    const [real, realRoot] = await Promise.all([realpath(filePath), realpath(root)]);

    const escaped = real !== realRoot && !real.startsWith(realRoot + path.sep);
    if (escaped) throw new NotFoundError();

    const file = await open(real, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      return await file.readFile({ encoding: 'utf8' });
    } finally {
      await file.close();
    }
  } catch (err) {
    if (err instanceof NotFoundError) throw err;

    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR' || code === 'ELOOP') throw new NotFoundError();
    throw err;
  }
}

export type ContentEntry = {
  url: string;
  segments: string[];
}

export const getContentPages = async (root: string): Promise<ContentEntry[]> => {
  const results: ContentEntry[] = [];

  const scanDirectory = async (dir: string, segments: string[]): Promise<void> => {
    const entries = await readdir(dir, { withFileTypes: true });
    const hasIndex = entries.some((e) => e.isFile() && e.name === 'index.md');

    if (segments.length > 0 && hasIndex) {
      results.push({ url: '/' + segments.map(encodeURIComponent).join('/'), segments });
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await scanDirectory(path.join(dir, entry.name), [...segments, entry.name]);
      }
    }
  }

  await scanDirectory(root, []);
  results.sort((a, b) => a.url.localeCompare(b.url));
  return results;
}
