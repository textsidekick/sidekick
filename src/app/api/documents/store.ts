import { kv } from "@vercel/kv";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
  chunks: string[];
  embeddings?: number[][];
  classification?: {
    type: string;
    title: string;
    confidence: number;
  };
}

const DOCS_KEY = "documents";

export async function getDocuments(): Promise<Document[]> {
  try {
    const docs = await kv.get<Document[]>(DOCS_KEY);
    return docs || [];
  } catch (e) {
    console.error("KV get error:", e);
    return [];
  }
}

export async function addDocument(doc: Document): Promise<void> {
  const docs = await getDocuments();
  docs.push(doc);
  await kv.set(DOCS_KEY, docs);
}

export async function updateDocumentEmbeddings(id: string, embeddings: number[][]): Promise<void> {
  const docs = await getDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.embeddings = embeddings;
    await kv.set(DOCS_KEY, docs);
  }
}

export async function updateDocumentClassification(id: string, classification: Document["classification"]): Promise<void> {
  const docs = await getDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.classification = classification;
    await kv.set(DOCS_KEY, docs);
  }
}

export async function deleteDocument(id: string): Promise<void> {
  const docs = await getDocuments();
  const filtered = docs.filter(d => d.id !== id);
  await kv.set(DOCS_KEY, filtered);
}
