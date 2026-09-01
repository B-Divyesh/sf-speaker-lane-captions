import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearCaptions, deleteCaptionDatabases, loadCaptions, saveCaption } from '../../src/db';

describe('local transcript store', () => {
  beforeEach(async () => clearCaptions());

  it('persists captions in chronological order', async () => {
    await saveCaption({ id: 'b', lane: 'right', text: 'Second', confidence: .8, createdAt: '2026-01-02T00:00:00.000Z', source: 'speech' });
    await saveCaption({ id: 'a', lane: 'left', text: 'First', confidence: null, createdAt: '2026-01-01T00:00:00.000Z', source: 'typed' });
    expect((await loadCaptions()).map((entry) => entry.text)).toEqual(['First', 'Second']);
  });

  it('deletes only databases under the requested demo prefix', async () => {
    const entry = { id: '1', lane: 'center' as const, text: 'Kept', confidence: null, createdAt: '2026-01-01T00:00:00.000Z', source: 'typed' as const };
    await saveCaption(entry, 'caption-lanes');
    await saveCaption({ ...entry, text: 'Temporary' }, 'demo:caption-lanes');
    await saveCaption({ ...entry, text: 'Legacy' }, 'demo:caption-lanes:legacy');

    await deleteCaptionDatabases('demo:caption-lanes');

    expect((await indexedDB.databases()).some(({ name }) => name?.startsWith('demo:caption-lanes'))).toBe(false);
    expect((await loadCaptions('caption-lanes')).map(({ text }) => text)).toEqual(['Kept']);
  });
});
