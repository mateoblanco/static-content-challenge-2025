import path from 'node:path';

export const resolveContentDir = (root: string, segments: string[]): string | null => {
  const hasInvalidSegment = segments.some((segment) =>
    segment.includes('\0')
    || segment.includes('/')
    || segment.includes('\\')
    || segment.startsWith('.')
  );
  if (hasInvalidSegment) return null;

  const dir = path.resolve(root, ...segments);
  const inside = dir === root || dir.startsWith(root + path.sep);
  return inside ? dir : null;
};
