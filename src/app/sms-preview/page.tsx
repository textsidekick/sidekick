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
  Sparkles,
  AlertCircle
} from "lucide-react";

// ============================================
// SCROLL ANIMATION UTILITIES
// ============================================

// Hook for scroll-triggered animations
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Animated wrapper component
const AnimateOnScroll = ({ children, delay = 0, className = '' }: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// MARQUEE FEATURE PILLS - Seamless loop
// ============================================
const FeatureMarquee = () => {
  const topRow = [
    { icon: Globe, text: '10+ Languages', color: 'text-blue-500' },
    { icon: Shield, text: 'SOC 2 Compliant', color: 'text-green-500' },
    { icon: Clock, text: '24/7 Available', color: 'text-purple-500' },
    { icon: FileText, text: 'Document AI', color: 'text-amber-500' },
    { icon: Users, text: 'Multi-Tenant', color: 'text-cyan-500' },
  ];
  
  const middleRow = [
    { icon: Zap, text: '2s Response Time', color: 'text-amber-500' },
    { icon: BarChart3, text: 'Analytics Dashboard', color: 'text-cyan-500' },
    { icon: MessageSquare, text: 'SMS Native', color: 'text-blue-500' },
    { icon: Brain, text: 'AI-Powered', color: 'text-purple-500' },
    { icon: Check, text: 'No App Required', color: 'text-green-500' },
  ];
  
  const bottomRow = [
    { icon: Factory, text: 'Manufacturing', color: 'text-zinc-500' },
    { icon: ShoppingCart, text: 'Retail', color: 'text-zinc-500' },
    { icon: Truck, text: 'Logistics', color: 'text-zinc-500' },
    { icon: Wrench, text: 'Automotive', color: 'text-zinc-500' },
    { icon: Users, text: 'Hourly Teams', color: 'text-zinc-500' },
  ];

  const Pill = ({ icon: Icon, text, color }: { icon: any; text: string; color: string }) => (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-zinc-200 whitespace-nowrap mx-3 flex-shrink-0">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm font-medium text-zinc-700">{text}</span>
    </div>
  );

  // Render items twice for seamless loop
  const renderRow = (items: any[]) => {
    const doubled = [...items, ...items];
    return doubled.map((item, i) => <Pill key={i} {...item} />);
  };

  return (
    <div className="w-full overflow-hidden py-6">
      {/* Top row - scrolls left */}
      <div className="relative mb-4 overflow-hidden">
        <div className="flex marquee-left">
          {renderRow(topRow)}
          {renderRow(topRow)}
        </div>
      </div>
      
      {/* Middle row - scrolls right */}
      <div className="relative mb-4 overflow-hidden">
        <div className="flex marquee-right">
          {renderRow(middleRow)}
          {renderRow(middleRow)}
        </div>
      </div>
      
      {/* Bottom row - scrolls left slower */}
      <div className="relative overflow-hidden">
        <div className="flex marquee-left-slow">
          {renderRow(bottomRow)}
          {renderRow(bottomRow)}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SMS DEMO COMPONENT - Exact copy from main page
// ============================================
const SMSDemo = () => {
  const [messages, setMessages] = useState<Array<{type: string, text?: string, isVoice?: boolean, duration?: string}>>([
    { type: 'outgoing', text: "Hello, today is my first day on the job at EDS Manufacturing in Santa Clara" },
    { type: 'incoming', text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 I'm Sidekick, your workplace assistant. Ask me anything!" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const conversationFlow = [
    { type: 'outgoing', text: 'Where do I park?' },
    { type: 'incoming', text: 'Employee parking is in Lot B behind the main building. Visitor parking is in front. 🅿️' },
    { type: 'outgoing', text: '¿A qué hora es el almuerzo?' },
    { type: 'incoming', text: 'El almuerzo es de 12:00 PM a 1:00 PM. La cafetería está en el edificio principal. 🍽️' },
    { type: 'outgoing', isVoice: true, duration: '0:15' },
    { type: 'incoming', text: '🎤 Got it! I learned 2 things from your voice message:\n\n"Safety vests are in the warehouse entrance. Hard hats are required in Zone B."' },
    { type: 'outgoing', text: '안전 장비는 어디서 받나요?' },
    { type: 'incoming', text: '안전 장비는 창고 입구 옆 장비실에서 받으실 수 있습니다. 🦺' },
  ];
  
  const [flowIndex, setFlowIndex] = useState(0);

  // Scroll within the iPhone container only
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (flowIndex >= conversationFlow.length) {
      // Reset after a pause
      const resetTimer = setTimeout(() => {
        setMessages([
          { type: 'outgoing', text: "Hello, today is my first day on the job at EDS Manufacturing in Santa Clara" },
          { type: 'incoming', text: "Welcome to EDS Manufacturing, Santa Clara! 🎉 I'm Sidekick, your workplace assistant. Ask me anything!" },
        ]);
        setFlowIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const currentMessage = conversationFlow[flowIndex];
    
    const timer = setTimeout(() => {
      if (currentMessage.type === 'outgoing') {
        setMessages(prev => [...prev, currentMessage]);
        setFlowIndex(prev => prev + 1);
      } else {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, currentMessage]);
          setFlowIndex(prev => prev + 1);
        }, 1200);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [flowIndex, messages]);

  // Static waveform heights
  const waveformHeights = [8, 12, 6, 18, 10, 22, 8, 14, 20, 6, 16, 12, 8, 22, 10, 14, 6, 18, 12, 8, 16, 10, 20, 8, 14];

  // Voice memo component
  const VoiceMemo = ({ duration }: { duration: string }) => (
    <div className="flex items-center gap-2 min-w-[180px]">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div className="flex-1 flex items-center gap-0.5">
        {/* Static waveform visualization */}
        {waveformHeights.map((height, i) => (
          <div 
            key={i} 
            className="w-[3px] bg-white/70 rounded-full"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <span className="text-white/80 text-xs ml-1">{duration}</span>
    </div>
  );

  return (
    <div className="relative w-[340px] mx-auto">
      {/* iPhone Frame - bigger */}
      <div className="relative bg-zinc-900 rounded-[3.5rem] p-3 shadow-2xl">
        {/* Dynamic Island - separated from top */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[105px] h-[32px] bg-black rounded-full z-20" />
        
        {/* Screen */}
        <div className="bg-[#f2f2f7] rounded-[2.8rem] overflow-hidden h-[680px] relative">
          {/* Contact Header - compact */}
          <div className="bg-[#f2f2f7] pt-12 pb-2 px-4 text-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-1 text-white font-semibold text-base">
              S
            </div>
            <p className="font-semibold text-zinc-900 text-[15px]">Sidekick</p>
            <p className="text-xs text-zinc-500">+1 (888) 707-4659</p>
          </div>
          
          {/* Messages Area - auto scroll within container */}
          <div 
            ref={messagesContainerRef}
            className="px-3 pb-16 h-[520px] overflow-y-auto scroll-smooth"
          >
            <div className="space-y-2">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] px-3.5 py-2 text-[15px] leading-[1.4] ${
                      msg.type === 'outgoing' 
                        ? 'bg-[#007AFF] text-white rounded-[18px] rounded-br-[4px]' 
                        : 'bg-[#E9E9EB] text-zinc-900 rounded-[18px] rounded-bl-[4px]'
                    }`}
                    style={{
                      animation: idx >= messages.length - 1 ? 'bubble-pop 0.25s ease-out forwards' : 'none',
                      transformOrigin: msg.type === 'outgoing' ? 'bottom right' : 'bottom left',
                    }}
                  >
                    {msg.isVoice ? (
                      <VoiceMemo duration={msg.duration || '0:15'} />
                    ) : (
                      <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div 
                    className="bg-[#E9E9EB] px-4 py-3 rounded-[18px] rounded-bl-[4px]"
                    style={{
                      animation: 'bubble-pop 0.25s ease-out forwards',
                      transformOrigin: 'bottom left',
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* iMessage Input Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#f2f2f7] px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
                <span className="text-zinc-500 text-xl leading-none">+</span>
              </div>
              <div className="flex-1 bg-white rounded-full px-4 py-2 text-[15px] text-zinc-400 border border-zinc-300">
                iMessage
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
            </div>
            {/* Home Indicator */}
            <div className="w-32 h-1 bg-zinc-900 rounded-full mx-auto mt-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PreviewPage() {
  const calLink = "https://cal.com/justin-so-xnr0oc/sidekick-demo";
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Rotating text for hero subtitle
  const rotatingPhrases = [
    "answers worker questions instantly.",
    "reduces manager interruptions.",
    "onboards new hires faster.",
    "speaks 10+ languages.",
    "works 24/7.",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Static star positions for consistent rendering - positioned on edges to avoid text
  const starPositions = [
    // Left side stars
    { left: 3, top: 15, opacity: 0.3 }, { left: 8, top: 35, opacity: 0.4 }, { left: 5, top: 55, opacity: 0.2 },
    { left: 12, top: 8, opacity: 0.5 }, { left: 10, top: 45, opacity: 0.3 }, { left: 6, top: 68, opacity: 0.4 },
    { left: 15, top: 25, opacity: 0.3 }, { left: 18, top: 60, opacity: 0.5 }, { left: 4, top: 42, opacity: 0.2 },
    { left: 14, top: 72, opacity: 0.4 }, { left: 9, top: 18, opacity: 0.3 }, { left: 7, top: 78, opacity: 0.5 },
    // Right side stars
    { left: 85, top: 12, opacity: 0.4 }, { left: 92, top: 32, opacity: 0.3 }, { left: 88, top: 52, opacity: 0.5 },
    { left: 95, top: 22, opacity: 0.2 }, { left: 90, top: 65, opacity: 0.4 }, { left: 83, top: 8, opacity: 0.3 },
    { left: 97, top: 45, opacity: 0.5 }, { left: 86, top: 75, opacity: 0.2 }, { left: 93, top: 58, opacity: 0.4 },
    { left: 89, top: 38, opacity: 0.3 }, { left: 96, top: 70, opacity: 0.5 }, { left: 84, top: 48, opacity: 0.2 },
    // Top edge stars (above text)
    { left: 25, top: 5, opacity: 0.3 }, { left: 40, top: 8, opacity: 0.4 }, { left: 55, top: 4, opacity: 0.2 },
    { left: 70, top: 7, opacity: 0.5 }, { left: 35, top: 3, opacity: 0.3 }, { left: 60, top: 6, opacity: 0.4 },
    // Bottom edge stars (below text, but above city)
    { left: 22, top: 58, opacity: 0.3 }, { left: 78, top: 55, opacity: 0.4 }, { left: 20, top: 62, opacity: 0.2 },
    { left: 80, top: 60, opacity: 0.5 }, { left: 25, top: 65, opacity: 0.3 }, { left: 75, top: 63, opacity: 0.4 },
  ];

  // Rotate through phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [rotatingPhrases.length]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const initLenis = async () => {
      try {
        const Lenis = (await import('@studio-freight/lenis')).default;
        
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        lenis.on('scroll', ({ scroll }: { scroll: number }) => {
          setScrollY(scroll);
        });

        return () => {
          lenis.destroy();
        };
      } catch (e) {
        // Fallback to regular scroll if Lenis fails to load
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
      }
    };

    setIsLoaded(true);
    initLenis();
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-serif { font-family: 'DM Serif Display', serif; }
        
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
        
        /* Lenis smooth scroll */
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }
        
        /* Floating animations */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        /* Marquee animations - seamless infinite scroll */
        .marquee-left {
          animation: scroll-left 20s linear infinite;
        }
        .marquee-right {
          animation: scroll-right 22s linear infinite;
        }
        .marquee-left-slow {
          animation: scroll-left 28s linear infinite;
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        /* Message animations */
        @keyframes message-slide-in {
          0% { 
            opacity: 0; 
            transform: translateY(10px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        .animate-message-in {
          animation: message-slide-in 0.3s ease-out forwards;
        }
        
        /* iMessage bubble animation - subtle slide up */
        @keyframes bubble-pop {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        /* Typing dots animation */
        @keyframes typing-dot {
          0%, 60%, 100% { 
            transform: translateY(0);
            opacity: 0.4;
          }
          30% { 
            transform: translateY(-3px);
            opacity: 1;
          }
        }
        .animate-typing-dot {
          animation: typing-dot 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* ============================================ */}
      {/* NAVIGATION */}
      {/* ============================================ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">S</span>
            </div>
            <span className={`font-semibold transition-colors duration-300 ${scrollY > 50 ? 'text-zinc-900' : 'text-white'}`}>Sidekick</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className={`text-sm transition-colors duration-300 hidden md:block ${scrollY > 50 ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/70 hover:text-white'}`}>How it works</a>
            <Link href="/about" className={`text-sm transition-colors duration-300 hidden md:block ${scrollY > 50 ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/70 hover:text-white'}`}>About</Link>
            <Link href="/contact" className={`text-sm transition-colors duration-300 hidden md:block ${scrollY > 50 ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/70 hover:text-white'}`}>Contact</Link>
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5"
            >
              Request Demo
            </a>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center bottom',
        }}
      >
        {/* Dark overlay for better text contrast at top */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 58, 95, 0.4) 0%, rgba(30, 58, 95, 0.1) 50%, transparent 100%)',
          }}
        />
        
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Star dots overlay - hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {starPositions.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>
        
        {/* Content - centered, positioned higher to not block hero */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-32 mb-48 md:mb-64 lg:mb-72">
          {/* Tagline at top */}
          <div className={`${isLoaded ? 'fade-up' : 'opacity-0'} mb-4`}>
            <p className="text-white/70 text-base italic">
              Every hero needs a <span className="text-white font-medium">Sidekick</span>
            </p>
          </div>
          
          {/* Main Headline */}
          <div className={`${isLoaded ? 'fade-up delay-100' : 'opacity-0'}`}>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-5 leading-[1.1] text-white">
              <em className="font-serif italic">Onboard</em> Faster.
              <br />
              Answer Instantly.
            </h1>
          </div>
          
          {/* Subtitle with rotating text */}
          <div className={`${isLoaded ? 'fade-up delay-200' : 'opacity-0'} mb-6`}>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              The AI assistant for manufacturing, retail, and logistics teams that
              <br />
              <span 
                className={`inline-block font-medium text-white transition-all duration-300 ${
                  isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}
              >
                {rotatingPhrases[phraseIndex]}
              </span>
            </p>
          </div>
          
          {/* CTA Button */}
          <div className={`${isLoaded ? 'fade-up delay-300' : 'opacity-0'}`}>
            <a 
              href={calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium text-base transition-all duration-300 border border-white/30 hover:scale-105"
            >
              BOOK A DEMO
            </a>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SMS DEMO SECTION */}
      {/* ============================================ */}
      <AnimateOnScroll>
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left side - Text */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="font-serif text-3xl md:text-4xl font-medium text-zinc-900 mb-4">
                  See it in action
                </h2>
                <p className="text-lg text-zinc-600 mb-6 max-w-lg">
                  Workers text questions, Sidekick answers instantly. No app downloads, no training required — just SMS.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Globe className="w-4 h-4 text-blue-500" />
                    10+ languages
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    2s response time
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Shield className="w-4 h-4 text-blue-500" />
                    SOC 2 ready
                  </div>
                </div>
              </div>
              
              {/* Right side - iPhone Demo */}
              <div className="flex-shrink-0">
                <SMSDemo />
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ============================================ */}
      {/* THE OPPORTUNITY - Problem vs Impact */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-8">
              <p className="text-blue-600 text-sm font-semibold mb-2">The Opportunity</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-zinc-900 mb-4">Why onboarding matters</h2>
              <p className="text-zinc-500 max-w-2xl mx-auto">80% of the global workforce doesn&apos;t sit at a desk. Poor onboarding costs businesses billions—but it doesn&apos;t have to.</p>
            </div>
          </AnimateOnScroll>
          
          {/* Scrolling Industry Pills */}
          <div className="relative mb-12">
            <div className="flex overflow-hidden">
              <div className="flex animate-marquee gap-3 py-4">
                {[
                  'Manufacturing', 'Retail', 'Automotive', 'Logistics', 'Restaurants', 
                  'Hospitality', 'Construction', 'Transportation', 'Warehousing', 'Healthcare',
                  'Food Service', 'Hotels', 'Security', 'Cleaning Services', 'Agriculture',
                  'Mining', 'Oil & Gas', 'Utilities', 'Landscaping', 'Plumbing',
                  'Electrical', 'HVAC', 'Roofing', 'Painting', 'Carpentry',
                ].map((industry, i) => (
                  <div key={i} className="flex-shrink-0 bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200">
                    <span className="text-sm font-medium text-zinc-600 whitespace-nowrap">{industry}</span>
                  </div>
                ))}
              </div>
              <div className="flex animate-marquee gap-3 py-4" aria-hidden="true">
                {[
                  'Manufacturing', 'Retail', 'Automotive', 'Logistics', 'Restaurants', 
                  'Hospitality', 'Construction', 'Transportation', 'Warehousing', 'Healthcare',
                  'Food Service', 'Hotels', 'Security', 'Cleaning Services', 'Agriculture',
                  'Mining', 'Oil & Gas', 'Utilities', 'Landscaping', 'Plumbing',
                  'Electrical', 'HVAC', 'Roofing', 'Painting', 'Carpentry',
                ].map((industry, i) => (
                  <div key={i} className="flex-shrink-0 bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200">
                    <span className="text-sm font-medium text-zinc-600 whitespace-nowrap">{industry}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <AnimateOnScroll delay={100}>
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 transition-all duration-500 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-zinc-600" />
                  </div>
                  <h3 className="font-semibold text-zinc-700">Industry Reality</h3>
                </div>
                
                <div className="space-y-5">
                  {[
                    { value: "60%", label: "of hourly workers quit within 90 days" },
                    { value: "$4,700", label: "average cost to replace one employee" },
                    { value: "23%", label: "leave due to poor training & support" },
                    { value: "40 hrs", label: "of manager time lost monthly to repeat questions" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-6 py-3 border-b border-zinc-200 last:border-0">
                      <p className="text-3xl font-bold text-zinc-400 w-28 flex-shrink-0">{stat.value}</p>
                      <p className="text-sm text-zinc-600 text-right flex-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll delay={200}>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 transition-all duration-500 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-800">With Sidekick</h3>
                </div>
                
                <div className="space-y-5">
                  {[
                    { value: "50%", label: "reduction in early turnover" },
                    { value: "70%", label: "faster time to productivity" },
                    { value: "15 hrs", label: "saved per manager per month" },
                    { value: "$18K", label: "annual savings per 50 employees" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-6 py-3 border-b border-green-200 last:border-0">
                      <p className="text-3xl font-bold text-green-600 w-28 flex-shrink-0">{stat.value}</p>
                      <p className="text-sm text-green-800 text-right flex-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SEE IT IN ACTION - Two Views */}
      {/* ============================================ */}
      <section 
        id="how-it-works" 
        className="relative py-20 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
        }}
      >
        {/* Grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Star dots overlay - hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {starPositions.slice(0, 30).map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <p className="text-white/80 text-sm font-semibold mb-2">See it in action</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-white mb-4">Two views. One platform.</h2>
              <p className="text-white/70 max-w-xl mx-auto">Workers get instant answers via text. Managers get insights and analytics.</p>
            </div>
          </AnimateOnScroll>
          
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Worker View */}
            <AnimateOnScroll delay={100}>
              <div className="bg-zinc-700 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 h-full flex flex-col">
                <div className="bg-zinc-600 px-4 py-3 border-b border-zinc-500">
                  <span className="text-xs font-medium text-zinc-300">Worker View — SMS</span>
                </div>
                <div className="p-4 flex-1 min-h-[380px]">
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-white">Where do I park on my first day?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-zinc-600 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-white">Park in Lot B behind the main building. Your badge will activate at 8am. See Section 3.2 of the Employee Handbook for full parking policies.</p>
                        <p className="text-xs text-zinc-400 mt-1">Answered in 2 seconds</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-white">What&apos;s the dress code?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-zinc-600 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-white">Steel-toed boots required on the floor. No loose clothing near machinery. Hard hats in Zone C.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
            
            {/* Manager View */}
            <AnimateOnScroll delay={200}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 h-full flex flex-col">
                <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200">
                  <span className="text-xs font-medium text-zinc-500">Manager View — Dashboard</span>
                </div>
                <div className="p-6 flex-1 min-h-[380px] flex flex-col">
                  <div className="mb-6 flex-1">
                    <h4 className="text-sm font-semibold text-zinc-900 mb-4">Top Questions This Week</h4>
                    <div className="space-y-2">
                      {[
                        { q: 'Where do I park?', count: 23 },
                        { q: 'What\'s the dress code?', count: 18 },
                        { q: 'How do I clock in?', count: 15 },
                        { q: 'Who is my supervisor?', count: 12 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-100 transition-colors duration-300 hover:bg-zinc-50">
                          <span className="text-sm text-zinc-600">{item.q}</span>
                          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded">{item.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-green-50 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105">
                      <p className="text-3xl font-bold text-green-600">94%</p>
                      <p className="text-xs text-green-700">Questions answered</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center transition-all duration-300 hover:scale-105">
                      <p className="text-3xl font-bold text-blue-600">2.3s</p>
                      <p className="text-xs text-blue-700">Avg response time</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* AI INSIGHTS */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div>
                <p className="text-amber-600 text-sm font-semibold mb-2">AI-Powered Insights</p>
                <h2 className="font-serif text-3xl md:text-4xl font-medium text-zinc-900 mb-6">More than just Q&A</h2>
                <p className="text-zinc-500 mb-6">
                  Sidekick doesn&apos;t just answer questions—it learns from them. Our AI identifies patterns, detects training gaps, and helps managers take action before small issues become big problems.
                </p>
                
                <div className="space-y-4">
                  {[
                    { title: 'Pattern Detection', desc: 'Spots repeat questions that signal confusion or missing info' },
                    { title: 'Training Gap Alerts', desc: 'Flags employees who may need additional support' },
                    { title: 'Actionable Recommendations', desc: 'Suggests next steps like scheduling check-ins or updating docs' },
                    { title: 'Continuous Learning', desc: 'Gets smarter with every question asked' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                        <p className="text-sm text-zinc-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll delay={200}>
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
                <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
                  <span className="text-sm font-medium text-amber-700 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    AI Insights
                  </span>
                </div>
                <div className="p-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">Training Gap Detected</p>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          Maria G. has asked 8 questions about forklift safety this week.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Trending Topic</p>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Questions about PTO policy increased 340% this week.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full text-left text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between font-medium group">
                      <span>Schedule check-in with Maria</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <button className="w-full text-left text-sm bg-zinc-50 hover:bg-zinc-100 text-zinc-600 px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between group">
                      <span>Send PTO policy reminder</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <p className="text-blue-600 text-sm font-semibold mb-2">Testimonials</p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-zinc-900 mb-4">What our customers say</h2>
            </div>
          </AnimateOnScroll>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Sidekick cut our onboarding time in half. New hires used to interrupt managers constantly—now they just text and get instant answers.",
                name: "Chris Kim",
                title: "Owner",
                company: "EDS Manufacturing",
                logo: "/logos/eds.png"
              },
              {
                quote: "Our stores are spread across multiple states. With Sidekick, every employee gets the same accurate answers whether they're in Texas or California.",
                name: "Kishore Muvva",
                title: "Owner",
                company: "Trinethra Supermarket",
                logo: "/logos/trinethra.png"
              },
              {
                quote: "In automotive, there's a lot of compliance info new techs need. Sidekick makes sure they get the right answers instantly.",
                name: "Jim Falk",
                title: "Owner",
                company: "Jim Falk Motors",
                logo: "/logos/jfm.png"
              },
            ].map((item, i) => (
              <AnimateOnScroll key={i} delay={i * 100}>
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-blue-100" />
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-1">
                    &quot;{item.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 mt-auto">
                    <Image src={item.logo} alt={item.company} width={40} height={40} className="rounded-lg object-contain" />
                    <div>
                      <p className="font-semibold text-zinc-900 text-sm">{item.name}</p>
                      <p className="text-zinc-500 text-xs">{item.title}, {item.company}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA */}
      {/* ============================================ */}
      <AnimateOnScroll>
        <section 
          className="relative py-20 px-6 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
          }}
        >
          {/* Grain texture overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Star dots overlay - hidden on mobile */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {starPositions.slice(10, 35).map((star, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  opacity: star.opacity,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-white mb-4">Ready to see Sidekick in action?</h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              We&apos;ll show you how Sidekick works with your actual documents. No commitment, no sales pressure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white hover:bg-white/90 text-slate-900 px-6 py-3.5 rounded-xl font-medium transition-all duration-300 w-full sm:w-auto justify-center hover:shadow-lg hover:-translate-y-0.5 group"
              >
                Request a Demo <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <Link 
                href="/contact"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium border border-white/30 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center hover:-translate-y-0.5"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-12 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 transition-transform duration-300 hover:scale-105 w-fit">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">S</span>
                </div>
                <span className="font-semibold text-white">Sidekick</span>
              </Link>
              <p className="text-zinc-500 text-sm mb-4 max-w-xs">
                AI onboarding assistant for deskless workers. Reduce turnover, free up managers.
              </p>
              <p className="text-zinc-500 text-sm">
                <a href="mailto:hello@sidekick.ai" className="hover:text-white transition-colors duration-300">hello@sidekick.ai</a>
              </p>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-zinc-500 text-sm hover:text-white transition-colors duration-300">About</Link></li>
                <li><Link href="/contact" className="text-zinc-500 text-sm hover:text-white transition-colors duration-300">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 text-sm hover:text-white transition-colors duration-300">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 text-sm hover:text-white transition-colors duration-300">Terms of Service</Link></li>
                <li><Link href="/sms-terms" className="text-zinc-500 text-sm hover:text-white transition-colors duration-300">SMS Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-800 pt-8 mb-8">
            <p className="text-zinc-600 text-xs text-center">
              SMS: Reply STOP to unsubscribe. Reply HELP for help. Msg & data rates may apply.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs">© 2026 Sidekick AI Inc. All rights reserved.</p>
            <p className="text-zinc-700 text-xs">Santa Clara, CA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
