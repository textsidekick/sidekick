"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Upload, Mic, ChevronLeft, Check, Building2, Users, Globe, FileText, Phone, Sparkles, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const industries = [
  { id: "manufacturing", label: "Manufacturing", icon: "🏭" },
  { id: "retail", label: "Retail", icon: "🛒" },
  { id: "logistics", label: "Logistics", icon: "📦" },
  { id: "automotive", label: "Automotive", icon: "🚗" },
  { id: "hospitality", label: "Hospitality", icon: "🏨" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "transportation", label: "Transportation", icon: "🚛" },
  { id: "construction", label: "Construction", icon: "🔨" },
  { id: "other", label: "Other", icon: "🏢" },
];

const rolesByIndustry: Record<string, string[]> = {
  manufacturing: ["Machine Operator", "Assembler", "Quality Control", "Forklift Driver", "Supervisor", "Maintenance", "Packaging", "Shipping/Receiving"],
  retail: ["Cashier", "Sales Associate", "Stock Room", "Customer Service", "Shift Lead", "Department Manager", "Loss Prevention"],
  logistics: ["Picker", "Packer", "Forklift Operator", "Loader", "Sorter", "Team Lead", "Inventory Clerk", "Driver"],
  automotive: ["Sales Rep", "Service Advisor", "Technician/Mechanic", "Parts Counter", "Detailer", "Lot Attendant", "F&I Manager", "Sales Manager"],
  hospitality: ["Front Desk", "Housekeeper", "Server", "Cook/Line Cook", "Host/Hostess", "Bartender", "Banquet Staff", "Supervisor"],
  healthcare: ["CNA", "Medical Assistant", "Receptionist", "Housekeeping", "Dietary Aide", "Transporter", "Unit Secretary", "Phlebotomist"],
  transportation: ["Driver", "Dispatcher", "Dock Worker", "Route Helper", "Fleet Mechanic", "Yard Jockey", "Logistics Coordinator"],
  construction: ["Laborer", "Carpenter", "Electrician", "Plumber", "HVAC Tech", "Equipment Operator", "Foreman", "Site Supervisor"],
  other: ["Frontline Worker", "Supervisor", "Team Lead", "Maintenance", "Customer Service", "Administrative"],
};

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇲🇽" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "tl", name: "Tagalog", flag: "🇵🇭" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
];

const generateSeedQuestions = (industry: string) => {
  const questions: Record<string, any[]> = {
    manufacturing: [
      { id: 1, category: "Arrival", question: "Where should new employees park?", options: ["Lot A (Front)", "Lot B (Back)", "Street parking", "Assigned spots"] },
      { id: 2, category: "Arrival", question: "Which entrance should workers use?", options: ["Main entrance", "Side door (Badge required)", "Loading dock", "Varies by shift"] },
      { id: 3, category: "Time", question: "How do workers clock in?", options: ["Kronos kiosk", "Badge scanner", "Mobile app", "Sign-in sheet"] },
      { id: 4, category: "Safety", question: "What PPE is required?", options: ["Steel-toe boots", "Safety glasses", "Hi-vis vest", "Gloves", "Hard hat"], multiSelect: true },
      { id: 5, category: "Breaks", question: "How long are breaks?", options: ["15 min paid", "30 min unpaid", "Two 15-min breaks", "Varies by shift"] },
      { id: 6, category: "Policies", question: "Phone policy on the floor?", options: ["No phones", "Silent only", "Designated areas only", "Allowed"] },
    ],
    retail: [
      { id: 1, category: "Arrival", question: "Where should employees park?", options: ["Back of lot", "Employee lot", "Street", "Anywhere after hours"] },
      { id: 2, category: "Arrival", question: "Which entrance for employees?", options: ["Back entrance", "Main before open", "Side door with code"] },
      { id: 3, category: "Time", question: "How do workers clock in?", options: ["POS system", "Time clock in back", "Mobile app", "Manager signs in"] },
      { id: 4, category: "Policies", question: "Dress code?", options: ["Company shirt + khakis", "All black", "Business casual", "Uniform provided"] },
      { id: 5, category: "Policies", question: "Employee discount?", options: ["10% off", "20% off", "25% off", "Varies by item"] },
      { id: 6, category: "Breaks", question: "How do breaks work?", options: ["15 min every 4 hours", "30 min for 6+ hour shifts", "When coverage allows"] },
    ],
  };
  questions.logistics = [
    { id: 1, category: "Arrival", question: "Where should workers park?", options: ["Employee lot", "Overflow lot", "Designated warehouse spots"] },
    { id: 2, category: "Arrival", question: "Check-in process?", options: ["Badge in at gate", "Sign in with security", "Go to station", "Team huddle first"] },
    { id: 3, category: "Time", question: "How do workers clock in?", options: ["Warehouse kiosk", "Mobile app", "Badge scanner", "Supervisor logs"] },
    { id: 4, category: "Safety", question: "Required PPE?", options: ["Steel-toe boots", "Safety vest", "Back brace", "Gloves"], multiSelect: true },
    { id: 5, category: "Operations", question: "How are assignments given?", options: ["Posted on board", "Scanner assigns", "Supervisor assigns", "App assigns"] },
    { id: 6, category: "Breaks", question: "Break schedule?", options: ["Set times", "Rotating breaks", "When workload allows", "Two 15s + 30 lunch"] },
  ];
  questions.automotive = [
    { id: 1, category: "Arrival", question: "Where do employees park?", options: ["Back lot", "Employee area", "Overflow lot", "Street"] },
    { id: 2, category: "Time", question: "How do workers clock in?", options: ["DMS system", "Time clock", "Mobile app", "Manager logs"] },
    { id: 3, category: "Sales", question: "How are customers assigned?", options: ["Rotation board", "Next up system", "Manager assigns", "Floor is open"] },
    { id: 4, category: "Service", question: "Test drive policy?", options: ["Copy license required", "Manager approval", "Salesperson rides along", "Varies"] },
    { id: 5, category: "Policies", question: "Dress code?", options: ["Branded polo + slacks", "Business casual", "Suit required", "Uniform provided"] },
    { id: 6, category: "Pay", question: "When is commission paid?", options: ["Weekly", "Bi-weekly", "Monthly", "At delivery"] },
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
  knowledgeSummary: { seedAnswers: number; documents: number; audioNotes: number; total: number };
  twilioNumber: string;
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
  
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    otherIndustry: "",
    location: "",
    employeeCount: "",
    roles: [] as string[],
    hasShifts: null as boolean | null,
    languages: ["en"],
    seedAnswers: {} as Record<number, string | string[]>,
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
    try {
      const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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
      case "roles": return form.roles.length > 0;
      case "languages": return form.languages.length > 0;
      case "contact": return form.managerName && form.managerPhone;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/manager" className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><ChevronLeft className="w-5 h-5" /><span className="text-sm">Back to Dashboard</span></Link>
          <span className="text-sm text-slate-500">Step {step + 1} of {steps.length}</span>
        </div>
      </header>
      <div className="px-4 py-4 overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-2">
          {steps.map((s, i) => (
            <button key={s.id} onClick={() => i < step && setStep(i)} disabled={i > step}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${i === step ? "bg-blue-500 text-white" : i < step ? "bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200" : "bg-slate-100 text-slate-400"}`}>
              <s.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
      <main className="px-4 pb-32">
        <div className="max-w-2xl mx-auto">
          {steps[step].id === "company" && (
            <div className="space-y-6">
              <div className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-800">Let&apos;s set up Sidekick</h1><p className="text-slate-500 mt-2">This takes about 10 minutes.</p></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label><input type="text" value={form.companyName} onChange={e => updateForm("companyName", e.target.value)} placeholder="e.g., EDS Manufacturing" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                <div className="grid grid-cols-3 gap-3">{industries.map(ind => (<button key={ind.id} onClick={() => updateForm("industry", ind.id)} className={`p-4 rounded-xl border-2 transition-all ${form.industry === ind.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}><div className="text-2xl mb-1">{ind.icon}</div><div className="text-sm font-medium">{ind.label}</div></button>))}</div>
              </div>
              {form.industry === "other" && (<div><label className="block text-sm font-medium text-slate-700 mb-2">What industry?</label><input type="text" value={form.otherIndustry} onChange={e => updateForm("otherIndustry", e.target.value)} placeholder="e.g., Food Processing" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" /></div>)}
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Location</label><input type="text" value={form.location} onChange={e => updateForm("location", e.target.value)} placeholder="e.g., Houston, TX" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">How many employees?</label><div className="grid grid-cols-4 gap-2">{["1-25", "26-100", "101-500", "500+"].map(size => (<button key={size} onClick={() => updateForm("employeeCount", size)} className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${form.employeeCount === size ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>{size}</button>))}</div></div>
            </div>
          )}
          {steps[step].id === "roles" && (
            <div className="space-y-6">
              <div className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-800">What roles do you have?</h1><p className="text-slate-500 mt-2">Select all that apply.</p></div>
              <div className="grid grid-cols-2 gap-2">{(rolesByIndustry[form.industry] || rolesByIndustry.other).map(role => (<button key={role} onClick={() => toggleRole(role)} className={`p-3 rounded-xl border-2 text-left transition-all ${form.roles.includes(role) ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}><div className="flex items-center gap-2"><div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${form.roles.includes(role) ? "bg-blue-500 border-blue-500" : "border-slate-300"}`}>{form.roles.includes(role) && <Check className="w-3 h-3 text-white" />}</div><span className="text-sm font-medium">{role}</span></div></button>))}</div>
            </div>
          )}
          {steps[step].id === "languages" && (
            <div className="space-y-6">
              <div className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-800">What languages do workers speak?</h1><p className="text-slate-500 mt-2">Sidekick responds in their preferred language.</p></div>
              <div className="grid grid-cols-2 gap-2">{languages.map(lang => (<button key={lang.code} onClick={() => toggleLanguage(lang.code)} className={`p-3 rounded-xl border-2 text-left transition-all ${form.languages.includes(lang.code) ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}><div className="flex items-center gap-3"><span className="text-xl">{lang.flag}</span><span className="text-sm font-medium">{lang.name}</span>{form.languages.includes(lang.code) && <Check className="w-4 h-4 text-blue-500 ml-auto" />}</div></button>))}</div>
            </div>
          )}
          {steps[step].id === "questions" && (
            <div className="space-y-6">
              <div className="text-center mb-6"><h1 className="text-2xl font-bold text-slate-800">Quick-fire setup</h1><p className="text-slate-500 mt-2">Tap to answer. Skip any you&apos;re not sure about.</p></div>
              <div className="space-y-4">{seedQuestions.map((q) => (<div key={q.id} className="bg-white rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 mb-3"><span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{q.category}</span></div><p className="font-medium text-slate-800 mb-3">{q.question}</p><div className="flex flex-wrap gap-2">{q.options.map((opt: string) => { const isSelected = q.multiSelect ? (form.seedAnswers[q.id] as string[] || []).includes(opt) : form.seedAnswers[q.id] === opt; return (<button key={opt} onClick={() => { if (q.multiSelect) { const current = (form.seedAnswers[q.id] as string[]) || []; const newVal = isSelected ? current.filter(v => v !== opt) : [...current, opt]; setForm(prev => ({ ...prev, seedAnswers: { ...prev.seedAnswers, [q.id]: newVal } })); } else { setForm(prev => ({ ...prev, seedAnswers: { ...prev.seedAnswers, [q.id]: opt } })); } }} className={`px-3 py-2 rounded-lg text-sm transition-all ${isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{opt}</button>); })}</div></div>))}</div>
            </div>
          )}
          {steps[step].id === "documents" && (
            <div className="space-y-6">
              <div className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-800">Got any documents?</h1><p className="text-slate-500 mt-2">Employee handbooks, policy docs, SOPs.</p></div>
              <label className="block"><div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"><Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="font-medium text-slate-700">Drop files or tap to upload</p><p className="text-sm text-slate-500 mt-1">PDF, Word, or text files</p><input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" /></div></label>
              {form.documents.length > 0 && (<div className="space-y-2">{form.documents.map((doc, i) => (<div key={i} className="flex items-center gap-3 bg-white rounded-xl border p-4"><FileText className="w-6 h-6 text-blue-500" /><span className="flex-1 font-medium truncate">{doc.name}</span>{doc.status === "processing" ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> : doc.status === "error" ? <AlertCircle className="w-5 h-5 text-red-500" /> : <Check className="w-5 h-5 text-green-500" />}</div>))}</div>)}
              <button onClick={() => setStep(step + 1)} className="w-full text-center text-sm text-slate-500 hover:text-slate-700 py-2">Skip → I&apos;ll add later</button>
            </div>
          )}
          {steps[step].id === "audio" && (
            <div className="space-y-6">
              <div className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-800">Add knowledge with your voice</h1><p className="text-slate-500 mt-2">Talk like you&apos;re explaining to a new hire.</p></div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">{isRecording ? (<><div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse"><div className="w-6 h-6 bg-red-500 rounded-sm" /></div><div className="text-3xl font-bold font-mono mb-2">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}</div><p className="text-blue-100 mb-4">Recording...</p><button onClick={stopRecording} className="w-full py-3 bg-white text-red-600 rounded-xl font-semibold">Stop Recording</button></>) : (<><div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4"><Mic className="w-10 h-10" /></div><p className="mb-4">Tap to start recording</p><button onClick={startRecording} className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold">Start Recording</button></>)}</div>
              {form.audioRecordings.length > 0 && (<div className="space-y-2">{form.audioRecordings.map((note, i) => (<div key={i} className="flex items-center gap-3 bg-white rounded-xl border p-4"><Mic className="w-6 h-6 text-blue-500" /><span className="flex-1">Recording {i + 1} ({note.duration}s)</span><Check className="w-5 h-5 text-green-500" /></div>))}</div>)}
              <button onClick={() => setStep(step + 1)} className="w-full text-center text-sm text-slate-500 hover:text-slate-700 py-2">Skip → I&apos;ll add later</button>
            </div>
          )}
          {steps[step].id === "contact" && (
            <div className="space-y-6">
              <div className="text-center mb-8"><h1 className="text-2xl font-bold text-slate-800">Your contact info</h1><p className="text-slate-500 mt-2">Sidekick will text you when it can&apos;t answer something.</p></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Your name</label><input type="text" value={form.managerName} onChange={e => updateForm("managerName", e.target.value)} placeholder="e.g., Mike Johnson" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2">Your phone number</label><input type="tel" value={form.managerPhone} onChange={e => updateForm("managerPhone", e.target.value)} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-2"><Mail className="w-4 h-4 inline mr-1" />Email (for daily digests)</label><input type="email" value={form.managerEmail} onChange={e => updateForm("managerEmail", e.target.value)} placeholder="mike@company.com" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none" /></div>
              {launchError && (<div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><div><p className="font-medium text-red-800">Error</p><p className="text-sm text-red-600">{launchError}</p></div></div>)}
            </div>
          )}
          {steps[step].id === "launch" && onboardingResult && (
            <div className="space-y-6 text-center">
              <div className="py-8"><div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg"><span className="text-5xl">🚀</span></div><h1 className="text-3xl font-bold text-slate-800 mb-2">You&apos;re all set!</h1><p className="text-slate-500 text-lg">Sidekick is ready for {onboardingResult.companyName}.</p></div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-left"><div className="flex items-center gap-2 mb-4"><CheckCircle2 className="w-5 h-5 text-green-600" /><p className="font-semibold text-green-800">Knowledge captured</p></div><div className="grid grid-cols-3 gap-4 text-center"><div><div className="text-2xl font-bold text-green-700">{onboardingResult.knowledgeSummary.seedAnswers}</div><div className="text-xs text-green-600">Quick answers</div></div><div><div className="text-2xl font-bold text-green-700">{onboardingResult.knowledgeSummary.documents}</div><div className="text-xs text-green-600">From docs</div></div><div><div className="text-2xl font-bold text-green-700">{onboardingResult.knowledgeSummary.audioNotes}</div><div className="text-xs text-green-600">Voice notes</div></div></div><div className="mt-4 pt-4 border-t border-green-200 text-center"><span className="text-lg font-bold text-green-700">{onboardingResult.knowledgeSummary.total} total knowledge items</span></div></div>
              <div className="bg-slate-100 rounded-2xl p-6 text-left"><p className="font-semibold text-slate-800 mb-4">📱 How workers join</p><div className="bg-white rounded-xl p-4"><p className="text-sm text-slate-600 mb-2">Workers text this to your Sidekick number:</p><div className="text-xl font-bold text-blue-600 font-mono bg-blue-50 rounded-lg p-3 text-center">{onboardingResult.joinCommand}</div><p className="text-sm text-slate-500 mt-3 text-center">Sidekick number: <span className="font-mono font-medium">{onboardingResult.twilioNumber}</span></p></div></div>
              <Link href="/manager" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all">Go to Dashboard →</Link>
            </div>
          )}
        </div>
      </main>
      {steps[step].id !== "launch" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 0 && (<button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl border-2 border-slate-200 font-medium">Back</button>)}
            <button onClick={() => step === steps.length - 2 ? handleLaunch() : setStep(step + 1)} disabled={!canProceed() || isLaunching}
              className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${canProceed() && !isLaunching ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}>
              {isLaunching ? (<><Loader2 className="w-5 h-5 animate-spin" />Saving...</>) : step === steps.length - 2 ? "Launch Sidekick 🚀" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
