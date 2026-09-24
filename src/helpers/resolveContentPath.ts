import path from 'node:path';

export const isRoutableContentSegment = (segment: string): boolean =>
  !segment.includes('\0')
  && !segment.includes('/')
  && !segment.includes('\\')
  && !segment.startsWith('.');

export const resolveContentDir = (root: string, segments: string[]): string | null => {
  if (!segments.every(isRoutableContentSegment)) return null;

  const dir = path.resolve(root, ...segments);
  const inside = dir === root || dir.startsWith(root + path.sep);
  return inside ? dir : null;
};
