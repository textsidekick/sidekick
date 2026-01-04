import { put, list, del } from "@vercel/blob";

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface Company {
  id: string;
  name: string;
  locations: Location[];
  createdAt: string;
}

export interface WorkerRegistration {
  phone: string;
  companyId: string;
  locationId: string;
  registeredAt: string;
}

const COMPANIES_KEY = "companies.json";
const WORKERS_KEY = "workers.json";

function getDefaultCompanies(): Company[] {
  return [
    { 
      id: "eds", 
      name: "EDS Manufacturing", 
      locations: [
        { id: "eds-santaclara", name: "EDS Santa Clara", city: "Santa Clara", state: "CA" },
        { id: "eds-sanjose", name: "EDS San Jose", city: "San Jose", state: "CA" },
      ],
      createdAt: new Date().toISOString() 
    },
    { 
      id: "trinethra", 
      name: "Trinethra Supermarket", 
      locations: [
        { id: "trinethra-fremont", name: "Trinethra Fremont", city: "Fremont", state: "CA" },
        { id: "trinethra-sunnyvale", name: "Trinethra Sunnyvale", city: "Sunnyvale", state: "CA" },
      ],
      createdAt: new Date().toISOString() 
    },
    { 
      id: "jfm", 
      name: "Jim Falk Motors", 
      locations: [
        { id: "jfm-beverlyhills", name: "Jim Falk Motors Beverly Hills", city: "Beverly Hills", state: "CA" },
        { id: "jfm-santamonica", name: "Jim Falk Motors Santa Monica", city: "Santa Monica", state: "CA" },
        { id: "jfm-losangeles", name: "Jim Falk Motors Los Angeles", city: "Los Angeles", state: "CA" },
      ],
      createdAt: new Date().toISOString() 
    },
  ];
}

async function fetchBlob(key: string): Promise<unknown | null> {
  try {
    const { blobs } = await list({ prefix: key });
    if (blobs.length === 0) return null;
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("Blob fetch error:", e);
    return null;
  }
}

async function saveBlob(key: string, data: unknown): Promise<void> {
  try {
    const { blobs } = await list({ prefix: key });
    for (const blob of blobs) await del(blob.url);
  } catch (e) {}
  await put(key, JSON.stringify(data), { access: "public", addRandomSuffix: false });
}

export async function getCompanies(): Promise<Company[]> {
  const data = await fetchBlob(COMPANIES_KEY);
  return (data as Company[]) || getDefaultCompanies();
}

export async function saveCompanies(companies: Company[]): Promise<void> {
  await saveBlob(COMPANIES_KEY, companies);
}

export async function getWorkers(): Promise<WorkerRegistration[]> {
  const data = await fetchBlob(WORKERS_KEY);
  return (data as WorkerRegistration[]) || [];
}

export async function saveWorkers(workers: WorkerRegistration[]): Promise<void> {
  await saveBlob(WORKERS_KEY, workers);
}

export async function getWorkerByPhone(phone: string): Promise<WorkerRegistration | null> {
  const workers = await getWorkers();
  const normalized = phone.replace(/\D/g, "").slice(-10);
  return workers.find(w => w.phone.replace(/\D/g, "").slice(-10) === normalized) || null;
}

export async function registerWorker(phone: string, companyId: string, locationId: string): Promise<void> {
  const workers = await getWorkers();
  const normalized = phone.replace(/\D/g, "").slice(-10);
  const filtered = workers.filter(w => w.phone.replace(/\D/g, "").slice(-10) !== normalized);
  filtered.push({ phone, companyId, locationId, registeredAt: new Date().toISOString() });
  await saveWorkers(filtered);
}

export async function getCompanyByPhone(phone: string): Promise<Company | null> {
  const worker = await getWorkerByPhone(phone);
  if (!worker) return null;
  const companies = await getCompanies();
  return companies.find(c => c.id === worker.companyId) || null;
}

export async function assignPhoneToCompany(phone: string, companyId: string): Promise<void> {
  const companies = await getCompanies();
  const company = companies.find(c => c.id === companyId);
  const defaultLocation = company?.locations[0]?.id || companyId;
  await registerWorker(phone, companyId, defaultLocation);
}
