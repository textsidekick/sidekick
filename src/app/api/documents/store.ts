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

function getDocsKey(companyId: string): string {
  return `documents-${companyId}.json`;
}

export async function getDocuments(companyId: string = "eds"): Promise<Document[]> {
  try {
    const key = getDocsKey(companyId);
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) return [];
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("Blob get error:", e);
    return [];
  }
}

async function saveDocuments(companyId: string, docs: Document[]): Promise<void> {
  const key = getDocsKey(companyId);
  try {
    const { blobs } = await list({ prefix: key });
    for (const blob of blobs) await del(blob.url);
  } catch (e) {}
  
  await put(key, JSON.stringify(docs), { access: "public", addRandomSuffix: false });
}

export async function addDocument(doc: Document, companyId: string = "eds"): Promise<void> {
  const docs = await getDocuments(companyId);
  docs.push(doc);
  await saveDocuments(companyId, docs);
}

export async function updateDocumentEmbeddings(id: string, embeddings: number[][], companyId: string = "eds"): Promise<void> {
  const docs = await getDocuments(companyId);
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.embeddings = embeddings;
    await saveDocuments(companyId, docs);
  }
}

export async function updateDocumentClassification(id: string, classification: Document["classification"], companyId: string = "eds"): Promise<void> {
  const docs = await getDocuments(companyId);
  const doc = docs.find(d => d.id === id);
  if (doc) {
    doc.classification = classification;
    await saveDocuments(companyId, docs);
  }
}

export async function deleteDocument(id: string, companyId: string = "eds"): Promise<void> {
  const docs = await getDocuments(companyId);
  const filtered = docs.filter(d => d.id !== id);
  await saveDocuments(companyId, filtered);
}
