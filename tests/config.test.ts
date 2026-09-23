import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('accepts the highest valid TCP port', () => {
    expect(loadConfig({ PORT: '65535' }).port).toBe(65535);
  });

  it.each(['0', '-1', '65536', 'not-a-number'])('rejects invalid PORT=%s', (PORT) => {
    expect(() => loadConfig({ PORT })).toThrow(`Invalid PORT: ${PORT}`);
  });
});
