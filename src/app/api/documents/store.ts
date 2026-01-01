export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
  chunks: string[];
  embeddings?: number[][];
}

declare global {
  var documentStore: Document[] | undefined;
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

export function updateDocumentEmbeddings(id: string, embeddings: number[][]): void {
  const docs = getDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.embeddings = embeddings;
  }
}

export function deleteDocument(id: string): void {
  if (global.documentStore) {
    global.documentStore = global.documentStore.filter(d => d.id !== id);
  }
}
