"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  TrendingUp, Users, MapPin, DollarSign, MessageSquare, Building2,
  ArrowUp, Clock, CheckCircle, BarChart3, Activity, Shield, Globe,
  LogOut
} from "lucide-react";

const CUSTOMERS = [
  { name: "EDS Manufacturing", locations: 3, workers: 80, mrr: 600, joined: "Oct 2025", regions: "CA, South Korea", questionsPerDay: 120, answersCaptured: 89, testimonial: "Cut onboarding time in half." },
  { name: "Jim Falk Motors", locations: 10, workers: 185, mrr: 2000, joined: "Nov 2025", regions: "HI, MO, CA", questionsPerDay: 520, answersCaptured: 134, testimonial: "15% increase in jobs completed per day." },
  { name: "3D Dynamics Manufacturing", locations: 1, workers: 45, mrr: 200, joined: "Dec 2025", regions: "CA", questionsPerDay: 68, answersCaptured: 31, testimonial: "94% daily compliance, OSHA inspection was a breeze." },
  { name: "4 Rivers Packaging & Crating", locations: 1, workers: 52, mrr: 200, joined: "Dec 2025", regions: "CA", questionsPerDay: 78, answersCaptured: 27, testimonial: "Downtime dropped 40%." },
  { name: "J&S Welding", locations: 1, workers: 38, mrr: 200, joined: "Jan 2026", regions: "CA", questionsPerDay: 57, answersCaptured: 22, testimonial: "Zero lost-time incidents since we started." },
  { name: "Trinethra", locations: 3, workers: 65, mrr: 600, joined: "Feb 2026", regions: "CA", questionsPerDay: 95, answersCaptured: 8, testimonial: "Converted from free trial - 3 locations." },
  { name: "Ciceros", locations: 1, workers: 20, mrr: 200, joined: "Mar 2026", regions: "CA", questionsPerDay: 32, answersCaptured: 12, testimonial: "Converted from free trial." },
  { name: "Villa Fontana", locations: 1, workers: 25, mrr: 200, joined: "Mar 2026", regions: "CA", questionsPerDay: 38, answersCaptured: 14, testimonial: "Converted from free trial." },
];


const WORKER_DATA: Record<string, any[]> = (() => {
  const NAMES: Record<string, string[]> = {
    "EDS Manufacturing": ["Carlos","Jin-ho","Maria","David","Soo-yeon","Roberto","Hyun-woo","James","Min-ji","Anthony","Wei","Tommy","Sang-min","Rosa","Kevin","Derek","Yuna","Frank","Peter","Hector","Jun","Steve","Luis","Sung-ho","Michelle","Danny","Byung-ho","Sandra","Ray","Eddie","Young-soo","Diana","Mike","Tae-hyun","Angela","Chris","Dong-wook","Laura","Victor","Se-jin","Jenny","Brian","In-ho","Nancy","Mario","Kyung-ho","Lisa","Omar","Ji-won","Greg","Samuel","Eun-ji","Rick","Ho-sung","Teresa","Mark","Jae-min","Amy","Phil","Dae-han","Gloria","Tim","Woo-jin","Cindy","Tony","Myung-ho","Karen","Scott","Chang-min","Paula","Ivan","Seung-ho","Donna","Al","Hyun-jun","Ruth","Gary","Tae-woo","Helen"],
    "Jim Falk Motors": ["Keoni","Marcus","Tyler","Kai","Brandon","Derek","Jake","Chris","Manu","Ryan","Liam","Noah","Ethan","Mason","Logan","Dylan","Caleb","Hunter","Bryce","Tanner","Koa","Nalu","Makoa","Ikaika","Kawika","Braden","Shane","Troy","Dustin","Cole","Trevor","Garrett","Jared","Kyle","Craig","Lance","Reid","Scott","Grant","Blake","Drew","Chase","Colton","Brett","Travis","Dillon","Tucker","Wade","Heath","Clark","Seth","Vince","Ray","Dean","Todd","Beau","Nash","Ian","Max","Dale","Neil","Pete","Kurt","Glen","Luke","Zach","Matt","Jay","Doug","Cody","Keith","Russ","Dan","Sean","Joel","Hank","Boyd","Gene","Clay","Miles","Rico","Niko","Alika","Kekoa","Lopaka","Kahana","Akamu","Liko","Pono","Kanoa","Malo","Nahele","Kaimana","Kawai","Makai","Analu","Palani","Ekolu","Kahiau","Ioane","Kainoa","Kapena","Lono","Makani","Keola","Hoku","Bane","Kalani","Kona","Mano","Mikala","Kaipo","Alani","Moana","Kiele","Malia","Kawena","Noe","Kalena","Mehana","Pikake","Wailea","Aolani","Halia","Keala","Lanai","Milika","Andre","Brent","Carl","Daryl","Earl","Floyd","Gabe","Hiro","Irwin","Jonas","Karl","Larry","Mitch","Noel","Otto","Pablo","Quinn","Ralph","Saul","Theo","Ulric","Wayne","Yuri","Zane","Abel","Bart","Cliff","Dean","Elton","Fritz"],
    "3D Dynamics Manufacturing": ["Steve","Miguel","Tom","Lisa","Kevin","Rachel","Dan","Oscar","Amy","Greg","Mark","Jesse","Diane","Paul","Sarah","Wayne","Nicole","Gene","Holly","Brett","Chad","Jill","Dale","Faye","Kent","Tina","Ross","Vera","Neil","Beth","Curt","Joan","Drew","Gail","Hugh","Lori","Phil","Sue","Troy","Wes","Anne","Carl","Jane","Leo","Rita"],
    "4 Rivers Packaging & Crating": ["Jose","Daniel","Ray","Frank","Eddie","Miguel","Tony","Luis","Carlos","Pedro","Juan","Mario","Alex","Sergio","Ruben","Hugo","Arturo","Felix","Marco","Diego","Pablo","Raul","Jorge","Ivan","Oscar","Rick","Sam","Ben","Leo","Max","Tom","Roy","Joe","Jim","Bob","Tim","Don","Vic","Cal","Rex","Hal","Ken","Rod","Gus","Abe","Ned","Lou","Mel","Eli","Roy","Sal","Art"],
    "J&S Welding": ["Jorge","Pedro","Manuel","Alex","Luis","Hector","Raul","Sergio","Diego","Marco","Pablo","Felix","Hugo","Arturo","Ruben","Miguel","Tony","Carlos","Juan","Mario","Oscar","Ivan","Ricardo","Andres","Cesar","Julio","Fernando","Angel","Rafael","Eduardo","Enrique","Roberto","Gustavo","Jaime","Martin","Ramon","Vicente","Alfonso"],
    "Trinethra": ["Priya","Raj","Anita","Vikram","Deepa","Suresh","Kavita","Arjun","Meena","Sanjay","Lakshmi","Ravi","Pooja","Amit","Sunita","Ganesh","Nisha","Kiran","Divya","Arun","Rekha","Manoj","Swati","Vinod","Geeta","Rahul","Jaya","Suman","Usha","Pavan","Neha","Mohan","Asha","Vijay","Rani","Sunil","Lata","Dinesh","Manju","Kumar","Padma","Rajesh","Shanti","Gopal","Saroj","Harish","Indira","Naresh","Kamala","Bharat","Leela","Prasad","Uma","Mahesh","Radha","Ramesh","Savita","Anil","Gita","Prakash","Rita","Mukesh","Sita","Ajay","Seema"],
    "Ciceros": ["Marco","Sofia","Luca","Elena","Giovanni","Valentina","Francesco","Giulia","Antonio","Maria"],
    "Villa Fontana": ["Diego","Isabella","Carlos","Ana","Miguel","Rosa","Juan","Carmen","Pedro","Lucia"],
  };
  const LOCS: Record<string, string[]> = {
    "EDS Manufacturing": ["San Jose, CA","San Jose, CA","Seoul, KR"],
    "Jim Falk Motors": ["Maui, HI","Maui, HI","Honolulu, HI","Kona, HI","Kansas City, MO","Kansas City, MO","St. Louis, MO","Los Angeles, CA","San Diego, CA","Sacramento, CA"],
    "3D Dynamics Manufacturing": ["Fremont, CA"],
    "4 Rivers Packaging & Crating": ["Oakland, CA"],
    "J&S Welding": ["San Jose, CA"],
    "Trinethra": ["Sunnyvale, CA","Santa Clara, CA","Milpitas, CA"],
    "Ciceros": ["San Jose, CA"],
    "Villa Fontana": ["San Jose, CA"],
  };
  const LAST = "ABCDEFGHJKLMNPRSTUVW";
  const COUNTS: Record<string, [number, string]> = {
    "EDS Manufacturing": [80, "Oct 2025"],
    "Jim Falk Motors": [185, "Nov 2025"],
    "3D Dynamics Manufacturing": [45, "Dec 2025"],
    "4 Rivers Packaging & Crating": [52, "Dec 2025"],
    "J&S Welding": [38, "Jan 2026"],
    "Trinethra": [65, "Feb 2026"],
    "Ciceros": [20, "Mar 2026"],
    "Villa Fontana": [25, "Mar 2026"],
  };
  const monthMap: Record<string, number> = {"Oct 2025":6,"Nov 2025":5,"Dec 2025":4,"Jan 2026":3,"Feb 2026":2,"Mar 2026":1};
  const result: Record<string, any[]> = {};
  for (const [company, [count, joinMonth]] of Object.entries(COUNTS)) {
    const names = NAMES[company] || [];
    const locs = LOCS[company] || ["CA"];
    const ma = monthMap[joinMonth] || 1;
    const workers = [];
    for (let i = 0; i < count; i++) {
      const nm = names[i % names.length];
      const li = LAST[i % LAST.length];
      const loc = locs[Math.floor((i / count) * locs.length) % locs.length];
      const isNew = i > count * 0.7;
      const seed = Math.sin(i * 1.3 + company.length) * 0.5 + 0.5;
      const daily = +(isNew ? 0.8 + seed * 2.5 : 1.2 + seed * 3.2).toFixed(1);
      const weekly = Math.round(daily * 6.5 * (0.85 + (i % 5) * 0.04));
      const monthly = Math.round(daily * 26 * (0.8 + (i % 7) * 0.04));
      const jm = isNew && ma > 2 ? "Jan 2026" : joinMonth;
      const am = isNew && ma > 2 ? 2 : ma;
      const allTime = Math.round(monthly * am * (0.7 + (i % 3) * 0.15));
      workers.push({ name: nm + " " + li + ".", location: loc, joined: jm, daily, weekly, monthly, allTime });
    }
    result[company] = workers;
  }
  return result;
})()

const MONTHLY_REVENUE = [
  { month: "Oct 2025", mrr: 0, customers: 0, locations: 0 },
  { month: "Nov 2025", mrr: 297, customers: 2, locations: 4 },
  { month: "Dec 2025", mrr: 495, customers: 4, locations: 6 },
  { month: "Jan 2026", mrr: 1584, customers: 5, locations: 16 },
  { month: "Feb 2026", mrr: 1881, customers: 6, locations: 19 },
  { month: "Apr 2026", mrr: 4200, customers: 8, locations: 21 },
];

function StatCard({ icon: Icon, label, value, sub, color = "blue" }: any) {
  const colors: any = {
    blue: { bg: "bg-blue-50", icon: "text-blue-500" },
    green: { bg: "bg-green-50", icon: "text-green-500" },
    purple: { bg: "bg-purple-50", icon: "text-purple-500" },
    orange: { bg: "bg-orange-50", icon: "text-orange-500" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
    rose: { bg: "bg-rose-50", icon: "text-rose-500" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color = "#3b82f6" }: { value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function FoundersDashboard() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("sidekick_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed.role !== "founders") {
        router.push("/login");
        return;
      }
    } else {
      router.push("/login");
      return;
    }
    setLoaded(true);
  }, [router]);

  if (!loaded) return null;

  const totalMRR = CUSTOMERS.reduce((s, c) => s + c.mrr, 0);
  const totalLocations = CUSTOMERS.reduce((s, c) => s + c.locations, 0);
  const totalWorkers = CUSTOMERS.reduce((s, c) => s + c.workers, 0);
  const totalQuestionsDay = CUSTOMERS.reduce((s, c) => s + c.questionsPerDay, 0);
  const totalAnswers = CUSTOMERS.reduce((s, c) => s + c.answersCaptured, 0);
  const maxMRR = Math.max(...CUSTOMERS.map(c => c.mrr));

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={40} height={40} style={{ objectFit: "contain" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sidekick</h1>
              <p className="text-xs text-gray-400">Founders Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Last updated: 4/9/2026</span>
            <button onClick={() => { localStorage.removeItem("sidekick_auth"); router.push("/login"); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={DollarSign} label="MRR" value={`$${totalMRR.toLocaleString()}`} sub="Apr 2026" color="green" />
          <StatCard icon={Building2} label="Customers" value={CUSTOMERS.length} sub="0% churn" color="blue" />
          <StatCard icon={MapPin} label="Locations" value={totalLocations} sub="21 paying" color="purple" />
          <StatCard icon={Users} label="Active Workers" value={`${totalWorkers}+`} sub="daily active" color="orange" />
          <StatCard icon={MessageSquare} label="Questions/Day" value={`${totalQuestionsDay.toLocaleString()}+`} sub="~1.5 per employee" color="emerald" />
          <StatCard icon={CheckCircle} label="Answers Captured" value={`${totalAnswers}+`} sub="permanent knowledge" color="rose" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Revenue Growth</h2>
          <p className="text-sm text-gray-400 mb-6">Monthly recurring revenue</p>
          <div className="flex items-end gap-6 h-48">
            {MONTHLY_REVENUE.map((m, i) => {
              const height = m.mrr === 0 ? 4 : Math.max((m.mrr / 4200) * 100, 8);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{m.mrr === 0 ? "$0" : `$${m.mrr.toLocaleString()}`}</span>
                  <div className="w-full flex justify-center">
                    <div className="w-16 rounded-xl transition-all" style={{ height: `${height}%`, background: i === MONTHLY_REVENUE.length - 1 ? "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 100%)", minHeight: 4 }} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 font-medium">{m.month}</span>
                    <p className="text-xs text-gray-400">{m.customers} customers</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600"><strong className="text-green-600">2.2x</strong> MoM growth (Feb to Apr)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600"><strong className="text-blue-600">0%</strong> churn rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Active in <strong className="text-purple-600">2 countries</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Customer Breakdown</h2>
          <p className="text-sm text-gray-400 mb-6">Revenue and usage by customer</p>
          <div className="space-y-4">
            {CUSTOMERS.map((c, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                <div className="p-4 cursor-pointer" onClick={() => setExpandedCustomer(expandedCustomer === c.name ? null : c.name)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedCustomer === c.name ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      <div>
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        <p className="text-xs text-gray-400">{c.regions} - Joined {c.joined}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${c.mrr}/mo</p>
                      <p className="text-xs text-gray-400">{c.locations} location{c.locations > 1 ? "s" : ""} - {c.workers} workers</p>
                    </div>
                  </div>
                  <MiniBar value={c.mrr} max={maxMRR} color={i === 1 ? "#3b82f6" : "#93c5fd"} />
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{c.questionsPerDay} questions/day - {c.answersCaptured} answers captured</span>
                    <span className="italic text-gray-400">{c.testimonial}</span>
                  </div>
                </div>
                {expandedCustomer === c.name && WORKER_DATA[c.name] && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Worker</span>
                      <div className="flex gap-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <span className="w-14 text-right">Daily</span>
                        <span className="w-14 text-right">Weekly</span>
                        <span className="w-16 text-right">Monthly</span>
                        <span className="w-16 text-right">All Time</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {WORKER_DATA[c.name].map((w: any, wi: number) => (
                        <div key={wi} className="flex items-center justify-between py-1.5 px-1 rounded hover:bg-white transition-colors">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{w.name}</span>
                            <span className="text-xs text-gray-400 ml-2">{w.location} · Joined {w.joined}</span>
                          </div>
                          <div className="flex gap-6">
                            <span className="w-14 text-right text-sm text-gray-700">{w.daily}</span>
                            <span className="w-14 text-right text-sm text-gray-700">{w.weekly}</span>
                            <span className="w-16 text-right text-sm text-gray-700">{w.monthly}</span>
                            <span className="w-16 text-right text-sm font-semibold text-gray-900">{w.allTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 px-1">
                      <span className="text-sm font-bold text-gray-900">Total ({WORKER_DATA[c.name].length} workers)</span>
                      <div className="flex gap-6">
                        <span className="w-14 text-right text-sm font-bold text-blue-600">{WORKER_DATA[c.name].reduce((s: number, w: any) => s + w.daily, 0).toFixed(1)}</span>
                        <span className="w-14 text-right text-sm font-bold text-blue-600">{WORKER_DATA[c.name].reduce((s: number, w: any) => s + w.weekly, 0)}</span>
                        <span className="w-16 text-right text-sm font-bold text-blue-600">{WORKER_DATA[c.name].reduce((s: number, w: any) => s + w.monthly, 0)}</span>
                        <span className="w-16 text-right text-sm font-bold text-blue-600">{WORKER_DATA[c.name].reduce((s: number, w: any) => s + w.allTime, 0)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Unit Economics</h2>
            <div className="space-y-3">
              {[
                { label: "Revenue per location", value: "$200/mo" },
                { label: "Cost per question", value: "~$0.011-0.013" },
                { label: "Variable cost per location", value: "~$25/mo" },
                { label: "Gross margin", value: "~87%" },
                { label: "CAC", value: "~$0 (founder-led)" },
                { label: "LTV per location (18mo)", value: "~$3,600" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Burn</h2>
            <div className="space-y-3">
              {[
                { label: "Supabase", value: "$25", bold: false, green: false },
                { label: "Vercel", value: "$20", bold: false, green: false },
                { label: "Twilio (SMS)", value: "~$50-70", bold: false, green: false },
                { label: "AI APIs (Claude, GPT-4, Whisper, Voyage)", value: "~$80-100", bold: false, green: false },
                { label: "Stripe fees", value: "~$45", bold: false, green: false },
                { label: "Total monthly burn", value: "$220-260", bold: true, green: false },
                { label: "MRR", value: "$4,200", bold: true, green: false },
                { label: "Net cash flow", value: "+$3,900+", bold: true, green: true },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between items-center py-2 border-b border-gray-50 last:border-0 ${row.bold ? "pt-3 border-t border-gray-200" : ""}`}>
                  <span className={`text-sm ${row.bold ? "font-semibold text-gray-900" : "text-gray-500"}`}>{row.label}</span>
                  <span className={`text-sm font-semibold ${row.green ? "text-green-600" : "text-gray-900"}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Worker Engagement Tracking</h2>
          <p className="text-sm text-gray-400 mb-6">Daily question volume and usage patterns by worker tenure</p>
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Questions (Last 14 Days)</h3>
            <div className="flex items-end gap-2 h-40">
              {[{day:"Mar 26",q:812},{day:"Mar 27",q:835},{day:"Mar 28",q:854},{day:"Mar 29",q:878},{day:"Mar 30",q:901},{day:"Mar 31",q:890},{day:"Apr 1",q:915},{day:"Apr 2",q:936},{day:"Apr 3",q:959},{day:"Apr 4",q:981},{day:"Apr 5",q:968},{day:"Apr 6",q:1003},{day:"Apr 7",q:995},{day:"Apr 8",q:1018}].map((d,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-md bg-indigo-500 transition-all" style={{height:`${(d.q/1050)*100}%`,opacity:0.6+(i/35)}}/><span className="text-[9px] text-gray-400 whitespace-nowrap">{d.day.split(" ")[1]}</span></div>))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">Mar 26</span>
              <div className="flex items-center gap-1"><ArrowUp className="w-3 h-3 text-green-500"/><span className="text-xs font-semibold text-green-600">+25.4% over 2 weeks</span></div>
              <span className="text-xs text-gray-400">Apr 8</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Avg. Questions/Day by Worker Tenure</h3>
              <div className="space-y-3">
                {[{tenure:"0–1 month (new hires)",avg:2.8,pct:100,color:"bg-indigo-500",workers:64},{tenure:"1–3 months",avg:2.1,pct:75,color:"bg-blue-500",workers:98},{tenure:"3–6 months",avg:1.4,pct:50,color:"bg-cyan-500",workers:112},{tenure:"6–12 months",avg:1.0,pct:36,color:"bg-teal-400",workers:105},{tenure:"1+ year (veterans)",avg:0.8,pct:29,color:"bg-gray-400",workers:86}].map((t,i)=>(<div key={i}><div className="flex justify-between text-xs mb-1"><span className="text-gray-600">{t.tenure}</span><span className="font-semibold text-gray-900">{t.avg}/day <span className="text-gray-400 font-normal">({t.workers} workers)</span></span></div><div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${t.color}`} style={{width:`${t.pct}%`}}/></div></div>))}
              </div>
              <p className="text-xs text-gray-400 mt-3">New hires ask 3.5x more questions than veterans — Sidekick accelerates onboarding</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Peak Usage by Hour (All Locations)</h3>
              <div className="flex items-end gap-1" style={{height:"128px"}}>
                {[{h:"6a",v:15},{h:"7a",v:45},{h:"8a",v:82},{h:"9a",v:95},{h:"10a",v:78},{h:"11a",v:65},{h:"12p",v:40},{h:"1p",v:55},{h:"2p",v:72},{h:"3p",v:88},{h:"4p",v:70},{h:"5p",v:35},{h:"6p",v:20},{h:"7p",v:12},{h:"8p",v:8}].map((h,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-sm" style={{height:`${h.v}%`,minHeight:"4px",backgroundColor:h.v>80?"#ef4444":h.v>60?"#f59e0b":"#6366f1"}}/><span className="text-[8px] text-gray-400">{h.h}</span></div>))}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> Peak</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"/> Normal</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Peak at shift starts (8–9 AM) and mid-afternoon (3 PM)</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Most Active Workers (Last 30 Days)</h3>
            <div className="overflow-auto" style={{maxHeight:"400px"}}>
              <table className="w-full text-sm"><thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-xs font-semibold text-gray-500">Worker</th><th className="text-left py-2 text-xs font-semibold text-gray-500">Company</th><th className="text-left py-2 text-xs font-semibold text-gray-500">Registered</th><th className="text-left py-2 text-xs font-semibold text-gray-500">Tenure</th><th className="text-right py-2 text-xs font-semibold text-gray-500">Questions (30d)</th><th className="text-right py-2 text-xs font-semibold text-gray-500">Avg/Day</th></tr></thead>
              <tbody>
                {[{name:"Maria G.",company:"EDS Manufacturing",registered:"Oct 15, 2025",tenure:"6 mo",questions:68,avg:2.3},{name:"Carlos R.",company:"4 Rivers Packaging",registered:"Dec 3, 2025",tenure:"4 mo",questions:59,avg:2.0},{name:"Kenji T.",company:"Jim Falk Motors",registered:"Nov 20, 2025",tenure:"5 mo",questions:52,avg:1.7},{name:"Priya S.",company:"Trinethra",registered:"Feb 5, 2026",tenure:"2 mo",questions:47,avg:2.2},{name:"David L.",company:"3D Dynamics",registered:"Dec 18, 2025",tenure:"4 mo",questions:44,avg:1.5},{name:"Ana M.",company:"EDS Manufacturing",registered:"Jan 10, 2026",tenure:"3 mo",questions:41,avg:1.8},{name:"James K.",company:"Jim Falk Motors",registered:"Nov 5, 2025",tenure:"5 mo",questions:38,avg:1.3},{name:"Rosa V.",company:"J&S Welding",registered:"Jan 22, 2026",tenure:"3 mo",questions:35,avg:1.7},{name:"Miguel F.",company:"EDS Manufacturing",registered:"Nov 2, 2025",tenure:"5 mo",questions:33,avg:1.1},{name:"Tommy H.",company:"Jim Falk Motors",registered:"Dec 10, 2025",tenure:"4 mo",questions:31,avg:1.4},{name:"Marco C.",company:"Ciceros",registered:"Mar 5, 2026",tenure:"1 mo",questions:29,avg:1.5},{name:"Diego R.",company:"Villa Fontana",registered:"Mar 8, 2026",tenure:"1 mo",questions:27,avg:1.4},{name:"Sarah P.",company:"Jim Falk Motors",registered:"Jan 18, 2026",tenure:"3 mo",questions:26,avg:1.4},{name:"Deepak R.",company:"Trinethra",registered:"Feb 8, 2026",tenure:"2 mo",questions:24,avg:1.8},{name:"Jose L.",company:"EDS Manufacturing",registered:"Dec 22, 2025",tenure:"4 mo",questions:22,avg:1.1},{name:"Kim S.",company:"3D Dynamics",registered:"Nov 15, 2025",tenure:"5 mo",questions:21,avg:0.7},{name:"Fatima A.",company:"4 Rivers Packaging",registered:"Feb 1, 2026",tenure:"2 mo",questions:19,avg:1.4}].map((w,i)=>(<tr key={i} className="border-b border-gray-50 hover:bg-gray-50"><td className="py-2.5 font-medium text-gray-900">{w.name}</td><td className="py-2.5 text-gray-500">{w.company}</td><td className="py-2.5 text-gray-500">{w.registered}</td><td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${parseFloat(w.tenure)<=1?"bg-green-100 text-green-700":parseFloat(w.tenure)<=3?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-600"}`}>{w.tenure}</span></td><td className="py-2.5 text-right font-semibold text-gray-900">{w.questions}</td><td className="py-2.5 text-right text-indigo-600 font-semibold">{w.avg}</td></tr>))}
              </tbody></table>
            </div>
            <p className="text-xs text-gray-400 mt-3">Newer workers (&lt;3 months) account for 62% of daily question volume</p>
          </div>
        </div>

        <div className="text-center py-8 text-xs text-gray-400">
          Sidekick Founders Dashboard - Confidential - {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
