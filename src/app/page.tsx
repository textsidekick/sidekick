"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { 
  FileText, 
  Brain, 
  MessageSquare, 
  BarChart3, 
  ArrowRight, 
  Check,
  Zap,
  Shield,
  Globe,
  Clock,
  Factory,
  ShoppingCart,
  Wrench,
  Truck,
  Users,
  TrendingUp,
  X,
  CheckCircle,
  Mail,
  Phone,
  Quote,
  DollarSign,
  Timer,
  UserMinus,
  UserCheck,
  Sparkles
} from "lucide-react";

export default function Home() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const isInside = e.clientY < rect.bottom + 100;
        if (isInside) {
          setMousePosition({
            x: e.clientX,
            y: e.clientY - rect.top,
          });
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      {/* ============================================ */}
      {/* NAVIGATION */}
      {/* ============================================ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#fafafa]/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">S</span>
            </div>
            <span className="font-semibold text-zinc-900">Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">How it works</a>
            <Link href="/about" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">About</Link>
            <Link href="/contact" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors hidden md:block">Contact</Link>
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Request Demo
            </a>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO - Clear Value Prop (Grandma Test) */}
      {/* ============================================ */}
      <section 
        ref={heroRef}
        className="relative pt-28 pb-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #fafafa 100%)' }}
      >
        {/* Cursor-following gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute transition-all duration-300 ease-out"
            style={{
              width: '800px',
              height: '800px',
              left: mousePosition.x - 400,
              top: mousePosition.y - 400,
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 30%, transparent 60%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{
              width: '600px',
              height: '600px',
              left: mousePosition.x - 300 + 100,
              top: mousePosition.y - 300 - 80,
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-200/15 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className={`text-center max-w-3xl mx-auto mb-10 ${isLoaded ? 'fade-up' : 'opacity-0'}`}>
            {/* Clear one-sentence value prop */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
              AI onboarding assistant for
              <br />
              <span className="text-blue-600">deskless workers.</span>
            </h1>
            
            {/* Sub-headline: Who + Benefit */}
            <p className="text-xl text-zinc-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              For manufacturing, retail, and logistics teams. Reduce early turnover and free up your managers from answering the same questions over and over.
            </p>
            
            {/* Soft CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a 
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto justify-center"
              >
                Request a Demo <ArrowRight className="w-4 h-4" />
              </a>
              <Link 
                href="/contact"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm w-full sm:w-auto justify-center"
              >
                Talk to Us
              </Link>
            </div>

            {/* Proof of reality */}
            <p className="text-sm text-zinc-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live with 4 customers across 4 states
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* LOGOS - Social Proof */}
      {/* ============================================ */}
      <section className="py-10 px-6 bg-white border-y border-zinc-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-zinc-400 text-xs font-medium uppercase tracking-wider mb-6">Trusted by frontline teams at</p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {[
              { src: "/logos/eds.png", name: "EDS Manufacturing" },
              { src: "/logos/trinethra.png", name: "Trinethra Supermarket" },
              { src: "/logos/jfm.png", name: "Jim Falk Motors" },
            ].map((logo, i) => (
              <div key={i} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <Image src={logo.src} alt={logo.name} width={32} height={32} className="object-contain rounded" />
                <span className="text-zinc-600 font-medium text-sm">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHO IT'S FOR - Market Focus */}
      {/* ============================================ */}
      <section className="py-16 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold mb-2">Who it&apos;s for</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Built for frontline industries</h2>
          </div>
          
          <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            {[
              { icon: Factory, label: 'Manufacturing' },
              { icon: ShoppingCart, label: 'Retail' },
              { icon: Wrench, label: 'Automotive' },
              { icon: Truck, label: 'Logistics' },
              { icon: Users, label: 'Hourly Teams' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-zinc-200 shadow-sm">
                <item.icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-zinc-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE OPPORTUNITY - Problem vs Impact Side by Side */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-semibold mb-2">The Opportunity</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why onboarding matters</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">80% of the global workforce doesn&apos;t sit at a desk. Poor onboarding costs businesses billions—but it doesn&apos;t have to.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* The Challenge - Neutral/Gray */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-zinc-600" />
                </div>
                <h3 className="font-semibold text-zinc-700">Industry Reality</h3>
              </div>
              
              <div className="space-y-5">
                {[
                  { value: "60%", label: "of hourly workers quit within 90 days", source: "SHRM" },
                  { value: "$4,700", label: "average cost to replace one employee", source: "SHRM" },
                  { value: "23%", label: "leave due to poor training & support", source: "Gallup" },
                  { value: "40 hrs", label: "manager time lost monthly on repeat Q's", source: "Industry avg" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-200 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-600">{stat.label}</p>
                      <p className="text-xs text-zinc-400">{stat.source}</p>
                    </div>
                    <p className="text-2xl font-bold text-zinc-400">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* With Sidekick - Green/Positive */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-green-800">With Sidekick</h3>
              </div>
              
              <div className="space-y-5">
                {[
                  { value: "50%", label: "reduction in early turnover", desc: "Workers feel supported" },
                  { value: "70%", label: "faster time to productivity", desc: "Answers in seconds" },
                  { value: "15 hrs", label: "saved per manager per month", desc: "No repeat questions" },
                  { value: "$18K", label: "annual savings per 50 employees", desc: "ROI in weeks" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-green-200 last:border-0">
                    <div>
                      <p className="text-sm text-green-800">{stat.label}</p>
                      <p className="text-xs text-green-600">{stat.desc}</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE SOLUTION - How It Actually Works */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-semibold mb-2">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Simple for everyone</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">No app downloads. No training required. Just text and get answers.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, step: '01', title: 'Workers ask', desc: 'Questions via SMS or web chat. No app download needed.' },
              { icon: FileText, step: '02', title: 'AI answers', desc: 'Using your actual handbooks, SOPs, and safety docs.' },
              { icon: BarChart3, step: '03', title: 'Managers see', desc: 'Where onboarding breaks down. What questions repeat.' },
              { icon: Brain, step: '04', title: 'System learns', desc: 'Gets smarter over time as more questions flow in.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{item.step}</span>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRODUCT VISUALS - Show Don't Tell */}
      {/* ============================================ */}
      <section className="relative py-24 overflow-hidden">
        {/* Dark background with grid */}
        <div className="absolute inset-0 bg-zinc-950" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-sm font-semibold mb-2">See it in action</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Two views. One platform.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Worker View */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200">
                <span className="text-xs font-medium text-zinc-500">Worker View — SMS</span>
              </div>
              <div className="p-6 space-y-4 min-h-[320px]">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    <p className="text-sm">Where do I park on my first day?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="text-sm text-zinc-700">Park in Lot B behind the main building. Your badge will activate at 8am. See Section 3.2 of the Employee Handbook for full parking policies.</p>
                    <p className="text-xs text-zinc-400 mt-2">Answered in 2 seconds</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%]">
                    <p className="text-sm">What&apos;s the dress code?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-100 px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[80%]">
                    <p className="text-sm text-zinc-700">Steel-toed boots required on the floor. No loose clothing near machinery. Hard hats in Zone C.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Manager View */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200">
                <span className="text-xs font-medium text-zinc-500">Manager View — Dashboard</span>
              </div>
              <div className="p-6 min-h-[320px]">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-4">Top Questions This Week</h4>
                  <div className="space-y-2">
                    {[
                      { q: 'Where do I park?', count: 23 },
                      { q: 'What\'s the dress code?', count: 18 },
                      { q: 'How do I clock in?', count: 15 },
                      { q: 'Who is my supervisor?', count: 12 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-100">
                        <span className="text-sm text-zinc-600">{item.q}</span>
                        <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded">{item.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">94%</p>
                    <p className="text-xs text-green-700">Questions answered</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">2.3s</p>
                    <p className="text-xs text-blue-700">Avg response time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHY DIFFERENT - Document Intelligence */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold mb-2">Why we&apos;re different</p>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">Document intelligence that actually works</h2>
              <p className="text-zinc-500 mb-8">
                Most AI tools require manual setup and constant maintenance. Sidekick automatically understands your documents and adapts to your workflows.
              </p>
              
              <div className="space-y-4">
                {[
                  'Automatically understands different document types (PDFs, Word, scanned images)',
                  'Adapts to each company\'s specific terminology and workflows',
                  'No manual setup, labeling, or training required',
                  'Gets smarter as more questions flow through the system',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-600" />
                    </div>
                    <p className="text-sm text-zinc-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Old vs New comparison */}
            <div className="space-y-4">
              <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <X className="w-5 h-5 text-zinc-400" />
                  <span className="font-semibold text-zinc-600">The Old Way</span>
                </div>
                <ul className="space-y-2.5 text-sm text-zinc-500">
                  <li className="flex items-start gap-2"><span className="text-zinc-400">•</span> Hunt down a supervisor who&apos;s busy</li>
                  <li className="flex items-start gap-2"><span className="text-zinc-400">•</span> Dig through a 200-page handbook</li>
                  <li className="flex items-start gap-2"><span className="text-zinc-400">•</span> Ask coworkers who might be wrong</li>
                  <li className="flex items-start gap-2"><span className="text-zinc-400">•</span> Give up and guess</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">With Sidekick</span>
                </div>
                <ul className="space-y-2.5 text-sm text-green-800">
                  <li className="flex items-start gap-2"><span className="text-green-500">•</span> Text a question from your phone</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">•</span> Get an accurate answer in seconds</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">•</span> Includes source reference</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">•</span> Works 24/7, even at 3am</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-semibold mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">What our customers say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Sidekick cut our onboarding time in half. New hires used to interrupt managers constantly with basic questions—now they just text and get instant answers. It's been a game-changer for our floor operations.",
                name: "Chris Kim",
                title: "Owner",
                company: "EDS Manufacturing",
                logo: "/logos/eds.png"
              },
              {
                quote: "Our stores are spread across multiple states, so consistent training was always a challenge. With Sidekick, every employee gets the same accurate answers whether they're in Texas or California.",
                name: "Kishore Muvva",
                title: "Owner",
                company: "Trinethra Supermarket",
                logo: "/logos/trinethra.png"
              },
              {
                quote: "In automotive, there's a lot of compliance and safety info that new techs need to know. Sidekick makes sure they get the right answers instantly instead of guessing or waiting for a manager.",
                name: "Jim Falk",
                title: "Owner",
                company: "Jim Falk Motors",
                logo: "/logos/jfm.png"
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-blue-100" />
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed mb-6">
                  &quot;{item.quote}&quot;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                  <Image 
                    src={item.logo} 
                    alt={item.company} 
                    width={40} 
                    height={40} 
                    className="rounded-lg object-contain"
                  />
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{item.name}</p>
                    <p className="text-zinc-500 text-xs">{item.title}, {item.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PROOF / TRACTION */}
      {/* ============================================ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#fafafa] border border-zinc-200 rounded-2xl p-8 md:p-10">
            <p className="text-blue-600 text-sm font-semibold mb-6 text-center">Early traction</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-900">4</p>
                <p className="text-sm text-zinc-500">Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-900">4</p>
                <p className="text-sm text-zinc-500">States</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-900">15+</p>
                <p className="text-sm text-zinc-500">Locations</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-zinc-900">500+</p>
                <p className="text-sm text-zinc-500">Workers</p>
              </div>
            </div>
            <p className="text-zinc-500 text-sm text-center">
              Piloting with manufacturing, retail, and automotive operators across the US
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TRUST & COMPLIANCE */}
      {/* ============================================ */}
      <section className="py-16 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-blue-600 text-sm font-semibold mb-2">Trust & Security</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Enterprise-ready from day one</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'SOC 2 Compliant', desc: 'Enterprise-grade security' },
              { icon: Globe, title: '10+ Languages', desc: 'English, Spanish, Chinese...' },
              { icon: Phone, title: 'SMS Compliant', desc: 'STOP/HELP supported' },
              { icon: Mail, title: 'Privacy First', desc: 'GDPR & CCPA ready' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-zinc-600" />
                </div>
                <h3 className="font-semibold text-zinc-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA - Soft */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to see Sidekick in action?</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            We&apos;ll show you how Sidekick works with your actual documents. No commitment, no sales pressure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-3.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
            >
              Request a Demo <ArrowRight className="w-4 h-4" />
            </a>
            <Link 
              href="/contact"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium border border-zinc-700 text-white hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER - Trust & Contact */}
      {/* ============================================ */}
      <footer className="py-12 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">S</span>
                </div>
                <span className="font-semibold text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 text-sm mb-4 max-w-xs">
                AI onboarding assistant for deskless workers. Reduce turnover, free up managers.
              </p>
              <p className="text-zinc-500 text-sm">
                <a href="mailto:hello@sidekick.ai" className="hover:text-white transition-colors">hello@sidekick.ai</a>
              </p>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-zinc-500 text-sm hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/sms-terms" className="text-zinc-500 text-sm hover:text-white transition-colors">SMS Terms</Link></li>
              </ul>
            </div>
          </div>
          
          {/* SMS Compliance */}
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <p className="text-zinc-600 text-xs text-center">
              SMS: Reply STOP to unsubscribe. Reply HELP for help. Msg & data rates may apply.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs">© 2025 Sidekick AI Inc. All rights reserved.</p>
            <p className="text-zinc-700 text-xs">Santa Clara, CA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
