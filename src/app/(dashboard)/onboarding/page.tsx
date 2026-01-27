"use client";
import React from "react";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Upload, Mic, ChevronLeft, Check, Building2, Users, Globe, FileText, Phone, Sparkles, Mail, AlertCircle, CheckCircle2, Loader2, Link as LinkIcon, Factory, ShoppingCart, Package, Car, Hotel, HeartPulse, Truck, Hammer, Home } from "lucide-react";

const industries = [
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "retail", label: "Retail", icon: ShoppingCart },
  { id: "logistics", label: "Logistics", icon: Package },
  { id: "automotive", label: "Automotive", icon: Car },
  { id: "hospitality", label: "Hospitality", icon: Hotel },
  { id: "healthcare", label: "Healthcare", icon: HeartPulse },
  { id: "transportation", label: "Transportation", icon: Truck },
  { id: "construction", label: "Construction", icon: Hammer },
  { id: "other", label: "Other", icon: Building2 },
];

const rolesByIndustry: Record<string, string[]> = {
  manufacturing: ["Machine Operator", "Assembler", "Quality Control", "Forklift Driver", "Supervisor", "Maintenance", "Packaging", "Shipping/Receiving", "Other"],
  retail: ["Cashier", "Sales Associate", "Stock Room", "Customer Service", "Shift Lead", "Department Manager", "Loss Prevention", "Other"],
  logistics: ["Picker", "Packer", "Forklift Operator", "Loader", "Sorter", "Team Lead", "Inventory Clerk", "Driver", "Other"],
  automotive: ["Sales Rep", "Service Advisor", "Technician/Mechanic", "Parts Counter", "Detailer", "Lot Attendant", "F&I Manager", "Sales Manager", "Other"],
  hospitality: ["Front Desk", "Housekeeper", "Server", "Cook/Line Cook", "Host/Hostess", "Bartender", "Banquet Staff", "Supervisor", "Other"],
  healthcare: ["CNA", "Medical Assistant", "Receptionist", "Housekeeping", "Dietary Aide", "Transporter", "Unit Secretary", "Phlebotomist", "Other"],
  transportation: ["Driver", "Dispatcher", "Dock Worker", "Route Helper", "Fleet Mechanic", "Yard Jockey", "Logistics Coordinator", "Other"],
  construction: ["Laborer", "Carpenter", "Electrician", "Plumber", "HVAC Tech", "Equipment Operator", "Foreman", "Site Supervisor", "Other"],
  other: ["Frontline Worker", "Supervisor", "Team Lead", "Maintenance", "Customer Service", "Administrative", "Other"],
};

const languages = [
  { code: "en", name: "English", flag: "us" },
  { code: "es", name: "Spanish", flag: "mx" },
  { code: "zh", name: "Chinese", flag: "cn" },
  { code: "vi", name: "Vietnamese", flag: "vn" },
  { code: "ko", name: "Korean", flag: "kr" },
  { code: "tl", name: "Tagalog", flag: "ph" },
  { code: "hi", name: "Hindi", flag: "in" },
  { code: "pt", name: "Portuguese", flag: "br" },
  { code: "other", name: "Other", flag: "globe" },
];

const generateSeedQuestions = (industry: string) => {
  const questions: Record<string, any[]> = {
    manufacturing: [
      { id: 1, category: "Arrival", question: "Where should new employees park?", options: ["Lot A (Front)", "Lot B (Back)", "Street parking", "Assigned spots", "Other"] },
      { id: 2, category: "Arrival", question: "Which entrance should workers use?", options: ["Main entrance", "Side door (Badge required)", "Loading dock", "Varies by shift", "Other"] },
      { id: 3, category: "Time", question: "How do workers clock in?", options: ["Kronos kiosk", "Badge scanner", "Mobile app", "Sign-in sheet", "Other"] },
      { id: 4, category: "Safety", question: "What PPE is required?", options: ["Steel-toe boots", "Safety glasses", "Hi-vis vest", "Gloves", "Hard hat", "Other"], multiSelect: true },
      { id: 5, category: "Breaks", question: "How long are breaks?", options: ["15 min paid", "30 min unpaid", "Two 15-min breaks", "Varies by shift", "Other"] },
      { id: 6, category: "Policies", question: "Phone policy on the floor?", options: ["No phones", "Silent only", "Designated areas only", "Allowed", "Other"] },
    ],
    retail: [
      { id: 1, category: "Arrival", question: "Where should employees park?", options: ["Back of lot", "Employee lot", "Street", "Anywhere after hours", "Other"] },
      { id: 2, category: "Arrival", question: "Which entrance for employees?", options: ["Back entrance", "Main before open", "Side door with code", "Other"] },
      { id: 3, category: "Time", question: "How do workers clock in?", options: ["POS system", "Time clock in back", "Mobile app", "Manager signs in", "Other"] },
      { id: 4, category: "Policies", question: "Dress code?", options: ["Company shirt + khakis", "All black", "Business casual", "Uniform provided", "Other"] },
      { id: 5, category: "Policies", question: "Employee discount?", options: ["10% off", "20% off", "25% off", "Varies by item", "Other"] },
      { id: 6, category: "Breaks", question: "How do breaks work?", options: ["15 min every 4 hours", "30 min for 6+ hour shifts", "When coverage allows", "Other"] },
    ],
  };
  questions.logistics = [
    { id: 1, category: "Arrival", question: "Where should workers park?", options: ["Employee lot", "Overflow lot", "Designated warehouse spots", "Other"] },
    { id: 2, category: "Arrival", question: "Check-in process?", options: ["Badge in at gate", "Sign in with security", "Go to station", "Team huddle first", "Other"] },
    { id: 3, category: "Time", question: "How do workers clock in?", options: ["Warehouse kiosk", "Mobile app", "Badge scanner", "Supervisor logs", "Other"] },
    { id: 4, category: "Safety", question: "Required PPE?", options: ["Steel-toe boots", "Safety vest", "Back brace", "Gloves", "Other"], multiSelect: true },
    { id: 5, category: "Operations", question: "How are assignments given?", options: ["Posted on board", "Scanner assigns", "Supervisor assigns", "App assigns", "Other"] },
    { id: 6, category: "Breaks", question: "Break schedule?", options: ["Set times", "Rotating breaks", "When workload allows", "Two 15s + 30 lunch", "Other"] },
  ];
  questions.automotive = [
    { id: 1, category: "Arrival", question: "Where do employees park?", options: ["Back lot", "Employee area", "Overflow lot", "Street", "Other"] },
    { id: 2, category: "Time", question: "How do workers clock in?", options: ["DMS system", "Time clock", "Mobile app", "Manager logs", "Other"] },
    { id: 3, category: "Sales", question: "How are customers assigned?", options: ["Rotation board", "Next up system", "Manager assigns", "Floor is open", "Other"] },
    { id: 4, category: "Service", question: "Test drive policy?", options: ["Copy license required", "Manager approval", "Salesperson rides along", "Varies", "Other"] },
    { id: 5, category: "Policies", question: "Dress code?", options: ["Branded polo + slacks", "Business casual", "Suit required", "Uniform provided", "Other"] },
    { id: 6, category: "Pay", question: "When is commission paid?", options: ["Weekly", "Bi-weekly", "Monthly", "At delivery", "Other"] },
  ];
  questions.hospitality = questions.retail;
  questions.healthcare = questions.manufacturing;
  questions.transportation = questions.logistics;
  questions.construction = questions.manufacturing;
  questions.other = questions.manufacturing;
  return questions[industry] || questions.manufacturing;
};

interface OnboardingResult {
  success: boolean;
  companyId: string;
  companyName: string;
  location: { city: string; state: string };
  knowledgeSummary: { seedAnswers: number; documents: number; audioNotes: number; websitePages: number; total: number };
  twilioNumber: string;
  accessCode: string;
  joinCommand: string;
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [onboardingResult, setOnboardingResult] = useState<OnboardingResult | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // State for "Other" text inputs
  const [otherRole, setOtherRole] = useState("");
  const [otherLanguage, setOtherLanguage] = useState("");
  const [otherAnswers, setOtherAnswers] = useState<Record<number, string>>({});
  
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    otherIndustry: "",
    location: "",
    employeeCount: "",
    websiteUrl: "",
    roles: [] as string[],
    hasShifts: null as boolean | null,
    languages: ["en"],
    seedAnswers: {} as Record<number, string | string[]>,
    customQA: [] as { question: string; answer: string }[],
    documents: [] as { name: string; content: string; status: string }[],
    audioRecordings: [] as { duration: number; base64: string; status: string }[],
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    digestTime: "end_of_day",
  });

  const steps = [
    { id: "company", title: "Company", icon: Building2 },
    { id: "roles", title: "Roles", icon: Users },
    { id: "languages", title: "Languages", icon: Globe },
    { id: "questions", title: "Quick Setup", icon: Sparkles },
    { id: "documents", title: "Documents", icon: FileText },
    { id: "audio", title: "Voice", icon: Mic },
    { id: "contact", title: "Contact", icon: Phone },
    { id: "launch", title: "Launch", icon: CheckCircle2 },
  ];

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleRole = (role: string) => setForm(prev => ({ ...prev, roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role] }));
  const toggleLanguage = (code: string) => setForm(prev => ({ ...prev, languages: prev.languages.includes(code) ? prev.languages.filter(l => l !== code) : [...prev.languages, code] }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      updateForm("documents", [...form.documents, { name: file.name, content: "", status: "processing" }]);
      try {
        const text = await file.text();
        setForm(prev => ({ ...prev, documents: prev.documents.map(d => d.name === file.name ? { ...d, content: text, status: "done" } : d) }));
      } catch {
        setForm(prev => ({ ...prev, documents: prev.documents.map(d => d.name === file.name ? { ...d, status: "error" } : d) }));
      }
    }
    e.target.value = "";
  };

  const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert("Please allow microphone access to record voice notes.");
    }
  };

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const base64 = await blobToBase64(audioBlob);
      setForm(prev => ({ ...prev, audioRecordings: [...prev.audioRecordings, { duration: recordingTime, base64: base64.split(",")[1] || base64, status: "done" }] }));
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    setRecordingTime(0);
  }, [recordingTime]);

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchError(null);
    
    // Include custom "Other" values
    const finalForm = {
      ...form,
      roles: form.roles.map(r => r === "Other" && otherRole ? otherRole : r),
      languages: form.languages.map(l => l === "other" && otherLanguage ? otherLanguage : l),
      seedAnswers: Object.fromEntries(
        Object.entries(form.seedAnswers).map(([k, v]) => {
          if (v === "Other" && otherAnswers[parseInt(k)]) {
            return [k, otherAnswers[parseInt(k)]];
          }
          if (Array.isArray(v) && v.includes("Other") && otherAnswers[parseInt(k)]) {
            return [k, v.map(item => item === "Other" ? otherAnswers[parseInt(k)] : item)];
          }
          return [k, v];
        })
      ),
    };
    
    try {
      const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || "Failed to save");
      if (data.success) { setOnboardingResult(data); setStep(step + 1); }
      else throw new Error(data.error || "Unknown error");
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : "Failed to save. Please try again.");
    } finally {
      setIsLaunching(false);
    }
  };

  const seedQuestions = generateSeedQuestions(form.industry || "manufacturing");

  const canProceed = () => {
    switch (steps[step].id) {
      case "company": return form.industry === "other" ? form.companyName && form.otherIndustry : form.companyName && form.industry;
      case "roles": return form.roles.length > 0 && (!form.roles.includes("Other") || otherRole);
      case "languages": return form.languages.length > 0 && (!form.languages.includes("other") || otherLanguage);
      case "contact": return form.managerName && form.managerPhone;
      default: return true;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)", color: "#1e293b" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "4px", background: "#e2e8f0", zIndex: 50 }}>
        <div style={{ height: "100%", background: "#3b82f6", transition: "all 0.5s", width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div style={{ background: "#eff6ff", borderBottom: "1px solid #dbeafe", padding: "8px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "14px", color: "#1d4ed8" }}>Demo Mode — Sample onboarding flow for new companies</span>
      </div>
      <header style={{ position: "sticky", top: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e2e8f0", padding: "12px 16px", zIndex: 40 }}>
        <div style={{ maxWidth: "672px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <img src="/images/logo/sidekick-logo-blue.png" alt="Sidekick" style={{ width: "32px", height: "32px" }} />
              <span style={{ fontWeight: 600, color: "#1e293b" }}>Sidekick</span>
            </Link>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span style={{ fontSize: "14px", color: "#64748b" }}>Onboarding</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontSize: "14px", color: "#64748b" }}>Step {step + 1} of {steps.length}</span><Link href="/" style={{ padding: "8px", borderRadius: "8px", background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={20} /></Link></div>
        </div>
      </header>

      <div style={{ padding: "16px", overflowX: "auto" }}>
        <div style={{ maxWidth: "672px", margin: "0 auto", display: "flex", gap: "8px" }}>
          {steps.map((s, i) => (
            <button key={s.id} onClick={() => i < step && setStep(i)} disabled={i > step}
              style={{ 
                display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, border: "none", cursor: i <= step ? "pointer" : "default",
                background: i === step ? "#3b82f6" : i < step ? "#f1f5f9" : "#eff6ff",
                color: i === step ? "white" : i < step ? "#1d4ed8" : "#94a3b8"
              }}>
              <s.icon style={{ width: "14px", height: "14px" }} /><span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <main style={{ padding: "0 16px 128px" }}>
        <div style={{ maxWidth: "672px", margin: "0 auto" }}>

          {steps[step].id === "company" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>Let&apos;s set up Sidekick</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>This takes about 10 minutes.</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Company Name</label>
                <input type="text" value={form.companyName} onChange={e => updateForm("companyName", e.target.value)} placeholder="e.g., EDS Manufacturing" 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Industry</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {industries.map(ind => (
                    <button key={ind.id} onClick={() => updateForm("industry", ind.id)} 
                      style={{ padding: "16px", borderRadius: "12px", border: `2px solid ${form.industry === ind.id ? "#3b82f6" : "#e2e8f0"}`, background: form.industry === ind.id ? "#eff6ff" : "white", cursor: "pointer" }}>
                      <div style={{ fontSize: "24px", marginBottom: "4px" }}>{React.createElement(ind.icon, { size: 24, color: "#3b82f6" })}</div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{ind.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.industry === "other" && (
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>What industry?</label>
                  <input type="text" value={form.otherIndustry} onChange={e => updateForm("otherIndustry", e.target.value)} placeholder="e.g., Food Processing" 
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Location</label>
                <input type="text" value={form.location} onChange={e => updateForm("location", e.target.value)} placeholder="e.g., Houston, TX" 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                  <LinkIcon style={{ width: "16px", height: "16px", display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                  Company Website <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
                </label>
                <input type="url" value={form.websiteUrl} onChange={e => updateForm("websiteUrl", e.target.value)} placeholder="e.g., www.yourcompany.com" 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>We&apos;ll import information from your website to help answer worker questions.</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>How many employees?</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {["1-25", "26-100", "101-500", "500+"].map(size => (
                    <button key={size} onClick={() => updateForm("employeeCount", size)} 
                      style={{ padding: "12px", borderRadius: "12px", border: `2px solid ${form.employeeCount === size ? "#3b82f6" : "#e2e8f0"}`, background: form.employeeCount === size ? "#eff6ff" : "white", fontSize: "14px", fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {steps[step].id === "roles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>What roles do you have?</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>Select all that apply.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {(rolesByIndustry[form.industry] || rolesByIndustry.other).map(role => (
                  <button key={role} onClick={() => toggleRole(role)} 
                    style={{ padding: "12px", borderRadius: "12px", border: `2px solid ${form.roles.includes(role) ? "#3b82f6" : "#e2e8f0"}`, background: form.roles.includes(role) ? "#eff6ff" : "white", textAlign: "left", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: `2px solid ${form.roles.includes(role) ? "#3b82f6" : "#cbd5e1"}`, background: form.roles.includes(role) ? "#3b82f6" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {form.roles.includes(role) && <Check style={{ width: "12px", height: "12px", color: "white" }} />}
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{role}</span>
                    </div>
                  </button>
                ))}
              </div>
              {form.roles.includes("Other") && (
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>What role?</label>
                  <input type="text" value={otherRole} onChange={e => setOtherRole(e.target.value)} placeholder="e.g., Quality Inspector" 
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
                </div>
              )}
            </div>
          )}

          {steps[step].id === "languages" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>What languages do workers speak?</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>Sidekick responds in their preferred language.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => toggleLanguage(lang.code)} 
                    style={{ padding: "12px", borderRadius: "12px", border: `2px solid ${form.languages.includes(lang.code) ? "#3b82f6" : "#e2e8f0"}`, background: form.languages.includes(lang.code) ? "#eff6ff" : "white", textAlign: "left", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {lang.flag === "globe" ? <Globe size={20} color="#64748b" /> : <img src={`https://flagcdn.com/w80/${lang.flag}.png`} alt={lang.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />}
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{lang.name}</span>
                      {form.languages.includes(lang.code) && <Check style={{ width: "16px", height: "16px", color: "#3b82f6", marginLeft: "auto" }} />}
                    </div>
                  </button>
                ))}
              </div>
              {form.languages.includes("other") && (
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>What language?</label>
                  <input type="text" value={otherLanguage} onChange={e => setOtherLanguage(e.target.value)} placeholder="e.g., Punjabi" 
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
                </div>
              )}
            </div>
          )}

          {steps[step].id === "questions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>Quick-fire setup</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>Tap to answer. Skip any you&apos;re not sure about.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {seedQuestions.map((q) => (
                  <div key={q.id} style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#2563eb", background: "#f1f5f9", padding: "2px 8px", borderRadius: "9999px" }}>{q.category}</span>
                    </div>
                    <p style={{ fontWeight: 500, color: "#1e293b", marginBottom: "12px" }}>{q.question}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {q.options.map((opt: string) => {
                        const isSelected = q.multiSelect ? (form.seedAnswers[q.id] as string[] || []).includes(opt) : form.seedAnswers[q.id] === opt;
                        return (
                          <button key={opt} onClick={() => {
                            if (q.multiSelect) {
                              const current = (form.seedAnswers[q.id] as string[]) || [];
                              const newVal = isSelected ? current.filter(v => v !== opt) : [...current, opt];
                              setForm(prev => ({ ...prev, seedAnswers: { ...prev.seedAnswers, [q.id]: newVal } }));
                            } else {
                              setForm(prev => ({ ...prev, seedAnswers: { ...prev.seedAnswers, [q.id]: opt } }));
                            }
                          }} 
                          style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px", border: "none", cursor: "pointer", background: isSelected ? "#3b82f6" : "#eff6ff", color: isSelected ? "white" : "#374151" }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {((form.seedAnswers[q.id] === "Other") || (Array.isArray(form.seedAnswers[q.id]) && (form.seedAnswers[q.id] as string[]).includes("Other"))) && (
                      <input 
                        type="text" 
                        value={otherAnswers[q.id] || ""} 
                        onChange={e => setOtherAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} 
                        placeholder="Please specify..." 
                        style={{ width: "100%", marginTop: "12px", padding: "10px 14px", borderRadius: "8px", border: "2px solid #e2e8f0", outline: "none", fontSize: "14px", color: "#1e293b", background: "white" }} 
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Custom Q&A Section */}
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "2px dashed #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontWeight: 600, color: "#1e293b" }}>Add your own Q&A</h3>
                    <p style={{ fontSize: "14px", color: "#64748b" }}>Questions workers commonly ask</p>
                  </div>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, customQA: [...prev.customQA, { question: "", answer: "" }] }))}
                    style={{ padding: "8px 16px", borderRadius: "8px", background: "#3b82f6", color: "white", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "14px" }}
                  >
                    + Add Question
                  </button>
                </div>
                {form.customQA.map((qa, index) => (
                  <div key={index} style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#8b5cf6", background: "#ede9fe", padding: "2px 8px", borderRadius: "9999px" }}>Custom</span>
                      <button
                        onClick={() => setForm(prev => ({ ...prev, customQA: prev.customQA.filter((_, i) => i !== index) }))}
                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={qa.question}
                      onChange={e => setForm(prev => ({ ...prev, customQA: prev.customQA.map((item, i) => i === index ? { ...item, question: e.target.value } : item) }))}
                      placeholder="Question (e.g., What is the WiFi password?)"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "2px solid #e2e8f0", outline: "none", fontSize: "14px", color: "#1e293b", background: "white", marginBottom: "8px" }}
                    />
                    <input
                      type="text"
                      value={qa.answer}
                      onChange={e => setForm(prev => ({ ...prev, customQA: prev.customQA.map((item, i) => i === index ? { ...item, answer: e.target.value } : item) }))}
                      placeholder="Answer (e.g., SidekickGuest123)"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "2px solid #e2e8f0", outline: "none", fontSize: "14px", color: "#1e293b", background: "white" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {steps[step].id === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>Got any documents?</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>Employee handbooks, policy docs, SOPs.</p>
              </div>
              
              {/* Cloud Storage Import */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Import from cloud storage</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button onClick={() => window.open(`/api/auth/google?companyId=${form.companyName.toLowerCase().replace(/\s+/g, '-')}`, '_self')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google Drive
                  </button>
                  <button onClick={() => window.open(`/api/auth/dropbox?companyId=${form.companyName.toLowerCase().replace(/\s+/g, '-')}`, '_self')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0061FF"><path d="M12 6.134L6 9.866l6 3.732 6-3.732-6-3.732zM6 13.866l6 3.732 6-3.732-6-3.732-6 3.732zm6 4.268l-6-3.732v3.732l6 3.732 6-3.732v-3.732l-6 3.732z"/></svg>
                    Dropbox
                  </button>
                  <button onClick={() => window.open(`/api/auth/microsoft?companyId=${form.companyName.toLowerCase().replace(/\s+/g, '-')}`, '_self')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                    OneDrive
                  </button>
                  <button onClick={() => window.open(`/api/auth/gusto?companyId=${form.companyName.toLowerCase().replace(/\s+/g, '-')}`, '_self')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 16px", background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#F45D48"/><path fill="white" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                    Gusto (HR)
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                <span style={{ fontSize: "14px", color: "#94a3b8" }}>or upload directly</span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              </div>

              <label style={{ display: "block", cursor: "pointer" }}>
                <div style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                  <Upload style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                  <p style={{ fontWeight: 500, color: "#374151" }}>Drop files or tap to upload</p>
                  <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>PDF, Word, or text files</p>
                  <input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} style={{ display: "none" }} />
                </div>
              </label>
              {form.documents.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {form.documents.map((doc, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
                      <FileText style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
                      <span style={{ flex: 1, fontWeight: 500, color: "#374151" }}>{doc.name}</span>
                      {doc.status === "processing" ? <Loader2 style={{ width: "20px", height: "20px", color: "#2563eb" }} /> : doc.status === "error" ? <AlertCircle style={{ width: "20px", height: "20px", color: "#ef4444" }} /> : <Check style={{ width: "20px", height: "20px", color: "#22c55e" }} />}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(step + 1)} style={{ width: "100%", textAlign: "center", fontSize: "14px", color: "#64748b", padding: "8px", background: "none", border: "none", cursor: "pointer" }}>Skip → I&apos;ll add later</button>
            </div>
          )}

          {steps[step].id === "audio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>Add knowledge with your voice</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>Talk like you&apos;re explaining to a new hire.</p>
              </div>
              <div style={{ background: "linear-gradient(to bottom right, #3b82f6, #2563eb)", borderRadius: "16px", padding: "24px", color: "white", textAlign: "center" }}>
                {isRecording ? (
                  <>
                    <div style={{ width: "80px", height: "80px", margin: "0 auto 16px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "24px", height: "24px", background: "#ef4444", borderRadius: "4px" }} />
                    </div>
                    <div style={{ fontSize: "30px", fontWeight: "bold", fontFamily: "monospace", marginBottom: "8px" }}>{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}</div>
                    <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "16px" }}>Recording...</p>
                    <button onClick={stopRecording} style={{ width: "100%", padding: "12px", background: "white", color: "#dc2626", borderRadius: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>Stop Recording</button>
                  </>
                ) : (
                  <>
                    <div style={{ width: "80px", height: "80px", margin: "0 auto 16px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Mic style={{ width: "40px", height: "40px" }} />
                    </div>
                    <p style={{ marginBottom: "16px" }}>Tap to start recording</p>
                    <button onClick={startRecording} style={{ width: "100%", padding: "12px", background: "white", color: "#2563eb", borderRadius: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>Start Recording</button>
                  </>
                )}
              </div>
              {form.audioRecordings.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {form.audioRecordings.map((note, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
                      <Mic style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
                      <span style={{ flex: 1, color: "#374151" }}>Recording {i + 1} ({note.duration}s)</span>
                      <Check style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(step + 1)} style={{ width: "100%", textAlign: "center", fontSize: "14px", color: "#64748b", padding: "8px", background: "none", border: "none", cursor: "pointer" }}>Skip → I&apos;ll add later</button>
            </div>
          )}

          {steps[step].id === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>Your contact info</h1>
                <p style={{ color: "#64748b", marginTop: "8px" }}>Sidekick will text you when it can&apos;t answer something.</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Your name</label>
                <input type="text" value={form.managerName} onChange={e => updateForm("managerName", e.target.value)} placeholder="e.g., Mike Johnson" 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Your phone number</label>
                <input type="tel" value={form.managerPhone} onChange={e => updateForm("managerPhone", e.target.value)} placeholder="(555) 123-4567" 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                  <Mail style={{ width: "16px", height: "16px", display: "inline", marginRight: "4px", verticalAlign: "middle" }} />Email (for daily digests)
                </label>
                <input type="email" value={form.managerEmail} onChange={e => updateForm("managerEmail", e.target.value)} placeholder="mike@company.com" 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "2px solid #e2e8f0", outline: "none", fontSize: "16px", color: "#1e293b", background: "white" }} />
              </div>
              {launchError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <AlertCircle style={{ width: "20px", height: "20px", color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p style={{ fontWeight: 500, color: "#991b1b" }}>Error</p>
                    <p style={{ fontSize: "14px", color: "#dc2626" }}>{launchError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {steps[step].id === "launch" && onboardingResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", textAlign: "center" }}>
              <div style={{ padding: "32px 0" }}>
                <div style={{ width: "96px", height: "96px", margin: "0 auto 24px", background: "linear-gradient(to bottom right, #4ade80, #16a34a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                  <span style={{ fontSize: "48px" }}>🚀</span>
                </div>
                <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>You&apos;re all set!</h1>
                <p style={{ color: "#64748b", fontSize: "18px" }}>Sidekick is ready for {onboardingResult.companyName}.</p>
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "24px", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <CheckCircle2 style={{ width: "20px", height: "20px", color: "#16a34a" }} />
                  <p style={{ fontWeight: 600, color: "#166534" }}>Knowledge captured</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#15803d" }}>{onboardingResult.knowledgeSummary.seedAnswers}</div>
                    <div style={{ fontSize: "12px", color: "#16a34a" }}>Quick answers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#15803d" }}>{onboardingResult.knowledgeSummary.documents}</div>
                    <div style={{ fontSize: "12px", color: "#16a34a" }}>From docs</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#15803d" }}>{onboardingResult.knowledgeSummary.audioNotes}</div>
                    <div style={{ fontSize: "12px", color: "#16a34a" }}>Voice notes</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#15803d" }}>{onboardingResult.knowledgeSummary.websitePages || 0}</div>
                    <div style={{ fontSize: "12px", color: "#16a34a" }}>From website</div>
                  </div>
                </div>
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #bbf7d0", textAlign: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#15803d" }}>{onboardingResult.knowledgeSummary.total} total knowledge items</span>
                </div>
              </div>

              <div style={{ background: "linear-gradient(to right, #eff6ff, #f1f5f9)", borderRadius: "16px", padding: "24px", textAlign: "left", border: "1px solid #bfdbfe" }}>
                <p style={{ fontWeight: 600, color: "#1e40af", marginBottom: "16px" }}>🔐 Your Company Access Code</p>
                <div style={{ background: "white", borderRadius: "12px", padding: "20px", textAlign: "center", border: "2px solid #3b82f6" }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", color: "#1d4ed8", fontFamily: "monospace", letterSpacing: "8px" }}>{onboardingResult.accessCode}</div>
                  <p style={{ fontSize: "14px", color: "#64748b", marginTop: "12px" }}>Share this code with your workers to join</p>
                </div>
              </div>

              <div style={{ background: "#eff6ff", borderRadius: "16px", padding: "24px", textAlign: "left" }}>
                <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: "16px" }}>📱 How workers join</p>
                <div style={{ background: "white", borderRadius: "12px", padding: "16px" }}>
                  <p style={{ fontSize: "14px", color: "#475569", marginBottom: "8px" }}>Workers text this to your Sidekick number:</p>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2563eb", fontFamily: "monospace", background: "#eff6ff", borderRadius: "8px", padding: "12px", textAlign: "center" }}>{onboardingResult.joinCommand}</div>
                  <p style={{ fontSize: "14px", color: "#64748b", marginTop: "12px", textAlign: "center" }}>Sidekick number: <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{onboardingResult.twilioNumber}</span></p>
                </div>
              </div>

              <Link href="/manager" style={{ display: "block", width: "100%", background: "#2563eb", color: "white", padding: "16px", borderRadius: "12px", fontWeight: 600, fontSize: "18px", textDecoration: "none", textAlign: "center" }}>Go to Dashboard →</Link>
            </div>
          )}

        </div>
      </main>

      {steps[step].id !== "launch" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e2e8f0", padding: "16px" }}>
          <div style={{ maxWidth: "672px", margin: "0 auto", display: "flex", gap: "12px" }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ padding: "12px 24px", borderRadius: "12px", border: "2px solid #e2e8f0", fontWeight: 500, background: "white", color: "#374151", cursor: "pointer" }}>Back</button>
            )}
            <button onClick={() => step === steps.length - 2 ? handleLaunch() : setStep(step + 1)} disabled={!canProceed() || isLaunching}
              style={{ 
                flex: 1, padding: "12px", borderRadius: "12px", fontWeight: 600, fontSize: "18px", border: "none", cursor: canProceed() && !isLaunching ? "pointer" : "default",
                background: canProceed() && !isLaunching ? "#3b82f6" : "#e2e8f0",
                color: canProceed() && !isLaunching ? "white" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}>
              {isLaunching ? (<><Loader2 style={{ width: "20px", height: "20px" }} />Saving...</>) : step === steps.length - 2 ? "Launch Sidekick 🚀" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
