import type { CaptionEntry } from './types';

const DB_NAME = 'caption-lanes';
const STORE = 'captions';

function deleteDatabase(databaseName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error(`Could not delete ${databaseName}.`));
    request.onblocked = () => reject(new Error(`Another tab is using ${databaseName}.`));
  });
}

function openDatabase(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
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

export async function loadCaptions(databaseName = DB_NAME): Promise<CaptionEntry[]> {
  const db = await openDatabase(databaseName);
  const transaction = db.transaction(STORE, 'readonly');
  const entries = await requestResult(transaction.objectStore(STORE).getAll() as IDBRequest<CaptionEntry[]>);
  db.close();
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveCaption(entry: CaptionEntry, databaseName = DB_NAME): Promise<void> {
  const db = await openDatabase(databaseName);
  const transaction = db.transaction(STORE, 'readwrite');
  transaction.objectStore(STORE).put(entry);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function replaceCaptions(entries: CaptionEntry[], databaseName = DB_NAME): Promise<void> {
  const db = await openDatabase(databaseName);
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

export async function clearCaptions(databaseName = DB_NAME): Promise<void> {
  return replaceCaptions([], databaseName);
}

export async function deleteCaptionDatabases(prefix: string): Promise<void> {
  const names = new Set([prefix]);
  if (typeof indexedDB.databases === 'function') {
    for (const database of await indexedDB.databases()) {
      if (database.name?.startsWith(prefix)) names.add(database.name);
    }
  }

  for (const name of names) await deleteDatabase(name);

  if (typeof indexedDB.databases === 'function') {
    const remaining = (await indexedDB.databases()).filter(({ name }) => name?.startsWith(prefix));
    if (remaining.length) throw new Error('Sample data deletion could not be confirmed.');
  }
}
