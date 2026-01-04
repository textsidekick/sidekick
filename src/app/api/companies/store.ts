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

export async function getCompanies(): Promise<Company[]> {
  try {
    const { blobs } = await list({ prefix: COMPANIES_KEY });
    if (blobs.length === 0) return getDefaultCompanies();
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("Companies fetch error:", e);
    return getDefaultCompanies();
  }
}

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
  ];
}

export async function saveCompanies(companies: Company[]): Promise<void> {
  try {
    const { blobs } = await list({ prefix: COMPANIES_KEY });
    for (const blob of blobs) await del(blob.url);
  } catch (e) {}
  
  await put(COMPANIES_KEY, JSON.stringify(companies), { access: "public", addRandomSuffix: false });
}

// Worker registration functions
export async function getWorkers(): Promise<WorkerRegistration[]> {
  try {
    const { blobs } = await list({ prefix: WORKERS_KEY });
    if (blobs.length === 0) return [];
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    return [];
  }
}

export async function saveWorkers(workers: WorkerRegistration[]): Promise<void> {
  try {
    const { blobs } = await list({ prefix: WORKERS_KEY });
    for (const blob of blobs) await del(blob.url);
  } catch (e) {}
  
  await put(WORKERS_KEY, JSON.stringify(workers), { access: "public", addRandomSuffix: false });
}

export async function getWorkerByPhone(phone: string): Promise<WorkerRegistration | null> {
  const workers = await getWorkers();
  const normalized = phone.replace(/\D/g, "").slice(-10);
  
  return workers.find(w => w.phone.replace(/\D/g, "").slice(-10) === normalized) || null;
}

export async function registerWorker(phone: string, companyId: string, locationId: string): Promise<void> {
  const workers = await getWorkers();
  const normalized = phone.replace(/\D/g, "").slice(-10);
  
  // Remove existing registration
  const filtered = workers.filter(w => w.phone.replace(/\D/g, "").slice(-10) !== normalized);
  
  // Add new registration
  filtered.push({
    phone,
    companyId,
    locationId,
    registeredAt: new Date().toISOString()
  });
  
  await saveWorkers(filtered);
}

// Legacy function for backward compatibility
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
