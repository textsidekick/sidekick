import { put, list, del } from "@vercel/blob";

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

const DOCS_KEY = "documents.json";

export async function getDocuments(): Promise<Document[]> {
  try {
    const { blobs } = await list({ prefix: DOCS_KEY });
    if (blobs.length === 0) return [];
    
    const response = await fetch(blobs[0].url);
    const docs = await response.json();
    return docs || [];
  } catch (e) {
    console.error("Blob get error:", e);
    return [];
  }
}

export async function saveDocuments(docs: Document[]): Promise<void> {
  // Delete old blob first
  try {
    const { blobs } = await list({ prefix: DOCS_KEY });
    for (const blob of blobs) {
      await del(blob.url);
    }
  } catch (e) {
    // Ignore delete errors
  }
  
  // Save new blob
  await put(DOCS_KEY, JSON.stringify(docs), {
    access: "public",
    addRandomSuffix: false,
  });
}

export async function addDocument(doc: Document): Promise<void> {
  const docs = await getDocuments();
  docs.push(doc);
  await saveDocuments(docs);
}

export async function updateDocumentEmbeddings(id: string, embeddings: number[][]): Promise<void> {
  const docs = await getDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.embeddings = embeddings;
    await saveDocuments(docs);
  }
}

export async function updateDocumentClassification(id: string, classification: Document["classification"]): Promise<void> {
  const docs = await getDocuments();
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.classification = classification;
    await saveDocuments(docs);
  }
}

export async function deleteDocument(id: string): Promise<void> {
  const docs = await getDocuments();
  const filtered = docs.filter(d => d.id !== id);
  await saveDocuments(filtered);
}
