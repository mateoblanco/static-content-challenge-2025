import path from 'node:path';
import { readFile, realpath } from 'node:fs/promises';
import { NotFoundError } from '../errors.js';
import { resolveContentDir } from './resolveContentPath.js';

export async function loadMarkdown(root: string, segments: string[]): Promise<string> {
  const dir = resolveContentDir(root, segments);
  if (!dir) throw new NotFoundError();

  const filePath = path.join(dir, 'index.md');

  try {
    const [real, realRoot] = await Promise.all([realpath(filePath), realpath(root)]);

    const escaped = real !== realRoot && !real.startsWith(realRoot + path.sep);
    if (escaped) throw new NotFoundError();

    return await readFile(real, 'utf8');
  } catch (err) {
    if (err instanceof NotFoundError) throw err;

    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') throw new NotFoundError();
    throw err;
  }
}