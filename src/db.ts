import type { CaptionEntry } from './types';

const DB_NAME = 'caption-lanes';
const STORE = 'captions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadCaptions(): Promise<CaptionEntry[]> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE, 'readonly');
  const entries = await requestResult(transaction.objectStore(STORE).getAll() as IDBRequest<CaptionEntry[]>);
  db.close();
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveCaption(entry: CaptionEntry): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE, 'readwrite');
  transaction.objectStore(STORE).put(entry);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function replaceCaptions(entries: CaptionEntry[]): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction(STORE, 'readwrite');
  const store = transaction.objectStore(STORE);
  store.clear();
  entries.forEach((entry) => store.put(entry));
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function clearCaptions(): Promise<void> {
  return replaceCaptions([]);
}
