// Shared document store
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
  chunks: string[];
}

// Global store that persists across requests in dev mode
declare global {
  var documentStore: Document[] | undefined;
}

if (!global.documentStore) {
  global.documentStore = [];
}

export function getDocuments(): Document[] {
  return global.documentStore || [];
}

export function addDocument(doc: Document): void {
  if (!global.documentStore) {
    global.documentStore = [];
  }
  global.documentStore.push(doc);
}

export function deleteDocument(id: string): void {
  if (global.documentStore) {
    global.documentStore = global.documentStore.filter(d => d.id !== id);
  }
}
