import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { NotFoundError } from '../errors.js';
import { resolveContentDir } from './resolveContentPath.js';

export async function loadMarkdown(root: string, segments: string[]): Promise<string> {
  const dir = resolveContentDir(root, segments);
  if (!dir) throw new NotFoundError();

  try {
    return await readFile(path.join(dir, 'index.md'), 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') throw new NotFoundError();
    throw err;
  }
}