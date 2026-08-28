import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearCaptions, loadCaptions, saveCaption } from '../../src/db';

describe('local transcript store', () => {
  beforeEach(async () => clearCaptions());

  it('persists captions in chronological order', async () => {
    await saveCaption({ id: 'b', lane: 'right', text: 'Second', confidence: .8, createdAt: '2026-01-02T00:00:00.000Z', source: 'speech' });
    await saveCaption({ id: 'a', lane: 'left', text: 'First', confidence: null, createdAt: '2026-01-01T00:00:00.000Z', source: 'typed' });
    expect((await loadCaptions()).map((entry) => entry.text)).toEqual(['First', 'Second']);
  });
});
