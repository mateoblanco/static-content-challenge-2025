import path from 'node:path';

export function resolveContentDir(root: string, segments: string[]): string | null {
  if (segments.some((s) => s.includes('\0') || s.startsWith('.'))) return null;

  const dir = path.resolve(root, ...segments);
  const inside = dir === root || dir.startsWith(root + path.sep);
  return inside ? dir : null;
}