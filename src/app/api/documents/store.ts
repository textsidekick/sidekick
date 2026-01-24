import { supabase } from "@/lib/supabase";

export interface Document {
  id: string;
  name: string;
  content?: string;
  companyId: string;
  createdAt?: string;
}

export async function getDocuments(companyId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    content: d.content,
    companyId: d.company_id,
    createdAt: d.created_at,
  }));
}

export async function saveDocument(doc: Omit<Document, "id">): Promise<Document | null> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      name: doc.name,
      content: doc.content,
      company_id: doc.companyId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving document:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    content: data.content,
    companyId: data.company_id,
    createdAt: data.created_at,
  };
}

export async function deleteDocument(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting document:", error);
    return false;
  }

  return true;
}
