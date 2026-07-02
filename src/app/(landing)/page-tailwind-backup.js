"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

// ============ SMS DEMO COMPONENT ============
const SMSDemo = () => {
  const [messages, setMessages] = useState([
    { type: 'outgoing', text: "Hello, today is my first day on the job at EDS Manufacturing in San Francisco" },
    { type: 'incoming', text: "Welcome to EDS Manufacturing, San Francisco! ! I'm Sidekick, your workplace assistant. Ask me anything!" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  
  const conversationFlow = [
    { type: 'outgoing', text: 'Where do I park?' },
    { type: 'incoming', text: 'Employee parking is in Lot B behind the main building. Visitor parking is in front. ️' },
    { type: 'outgoing', text: '¿A qué hora es el almuerzo?' },
    { type: 'incoming', text: 'El almuerzo es de 12:00 PM a 1:00 PM. La cafetería está en el edificio principal. ️' },
  ];
  
  const [flowIndex, setFlowIndex] = useState(0);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (flowIndex >= conversationFlow.length) {
      const resetTimer = setTimeout(() => {
        setMessages([
          { type: 'outgoing', text: "Hello, today is my first day on the job at EDS Manufacturing in San Francisco" },
          { type: 'incoming', text: "Welcome to EDS Manufacturing, San Francisco! ! I'm Sidekick, your workplace assistant. Ask me anything!" },
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
  }, [flowIndex]);

  return (
    <div className="relative w-[300px] mx-auto scale-[0.92] origin-top">
      <div className="relative bg-[#18181b] rounded-[3rem] p-[10px] shadow-2xl">
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[95px] h-[28px] bg-black rounded-full z-20" />
        <div className="bg-[#f2f2f7] rounded-[2.5rem] overflow-hidden h-[600px] relative">
          <div className="bg-[#f2f2f7] pt-[44px] pb-[6px] px-[14px] text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-1 overflow-hidden">
              <Image src="/images/logo/sidekick-logo-white.png" alt="Sidekick" width={26} height={26} className="object-contain" />
            </div>
            <p className="font-semibold text-[#18181b] text-sm m-0">Sidekick</p>
            <p className="text-[11px] text-[#71717a] m-0">+1 (888) 707-4659</p>
          </div>
          
          <div ref={messagesContainerRef} className="px-[10px] pb-[58px] h-[460px] overflow-y-auto">
            <div className="flex flex-col gap-[6px]">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] py-[7px] px-3 text-sm leading-[1.4] rounded-2xl ${
                    msg.type === 'outgoing' 
                      ? 'bg-[#007AFF] text-white rounded-br-[4px]' 
                      : 'bg-[#E9E9EB] text-[#18181b] rounded-bl-[4px]'
                  }`}>
                    <span className="whitespace-pre-line">{msg.text}</span>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#E9E9EB] py-[10px] px-[14px] rounded-2xl rounded-bl-[4px]">
                    <div className="flex gap-1">
                      <div className="w-[7px] h-[7px] bg-[#a1a1aa] rounded-full animate-bounce" />
                      <div className="w-[7px] h-[7px] bg-[#a1a1aa] rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-[7px] h-[7px] bg-[#a1a1aa] rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-[#f2f2f7] p-[6px_10px]">
            <div className="flex items-center gap-[6px]">
              <div className="w-7 h-7 bg-[#e4e4e7] rounded-full flex items-center justify-center">
                <span className="text-[#71717a] text-lg leading-none">+</span>
              </div>
              <div className="flex-1 bg-white rounded-full py-[6px] px-[14px] text-sm text-[#a1a1aa] border border-[#d4d4d8]">
                iMessage
              </div>
              <div className="w-7 h-7 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#a1a1aa]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
            </div>
            <div className="w-[110px] h-1 bg-[#18181b] rounded-full mx-auto mt-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ HEADER COMPONENT ============
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo/sidekick-logo.png" alt="Sidekick" width={32} height={32} />
            <span className="text-xl font-semibold text-[#1A1615]">Sidekick</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#1A1615] hover:text-blue-500 transition-colors">How it works</a>
            <Link href="/about" className="text-[#1A1615] hover:text-blue-500 transition-colors">About</Link>
            <Link href="/contact" className="text-[#1A1615] hover:text-blue-500 transition-colors">Contact</Link>
          </nav>
          
          <a href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="hidden md:inline-flex bg-[#1A1615] text-white px-6 py-3 rounded-full font-medium hover:bg-blue-500 transition-colors">
            Request Demo
          </a>
          
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4"
          >
            <nav className="flex flex-col gap-4">
              <a href="#features" className="text-[#1A1615]">How it works</a>
              <Link href="/about" className="text-[#1A1615]">About</Link>
              <Link href="/contact" className="text-[#1A1615]">Contact</Link>
              <a href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="bg-[#1A1615] text-white px-6 py-3 rounded-full font-medium text-center">
                Request Demo
              </a>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

// ============ HERO COMPONENT ============
const Hero = () => {
  const featurePills = [
    { icon: "Voice:", title: "Voice Memos", desc: "Speak questions instead of typing" },
    { icon: "", title: "10+ Languages", desc: "Spanish, Korean, Mandarin & more" },
    { icon: "", title: "Learns Over Time", desc: "From docs, voice memos & manager answers" },
    { icon: "", title: "No App Needed", desc: "Works via SMS on any phone" },
  ];

  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" style={{ backgroundImage: 'url(/images/hero/hero-bg-new.png)', backgroundPosition: 'center 60%' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="inline-block px-5 py-2 border border-[#1A161530] rounded-full text-sm font-medium text-[#1A1615] bg-white/80 mb-6">
               Every hero needs a Sidekick
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-6xl font-serif text-[#1A1615] mb-6 leading-tight">
              <em>Onboard</em> Faster.<br/>Answer Instantly.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-[#1A1615]/70 mb-8 max-w-xl">
              The AI SMS assistant that lets frontline workers get instant answers via text or voice memo in any language—while detecting training gaps and saving managers hours each week.
            </motion.p>
            <motion.a variants={fadeInUp} href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="inline-flex items-center gap-2 bg-[#1A1615] text-white px-8 py-4 rounded-full font-medium hover:bg-blue-500 transition-all hover:-translate-y-1 hover:shadow-lg">
              Book a Demo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
          
          <div className="relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <SMSDemo />
            </motion.div>
            
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex-col gap-4 hidden xl:flex">
              {featurePills.map((pill, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  className="bg-white/95 rounded-2xl p-4 shadow-lg max-w-[180px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{pill.icon}</span>
                    <span className="font-semibold text-sm text-[#1A1615]">{pill.title}</span>
                  </div>
                  <p className="text-xs text-[#1A1615]/70">{pill.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============ MARQUEE COMPONENT ============
const Marquee = () => {
  const items = ["SMS Support", "Voice Memos", "10+ Languages", "Gap Detection", "24/7 Answers", "No App Required"];
  
  return (
    <section className="py-6 overflow-hidden bg-[#1A1615] relative">
      <div className="marquee-container">
        <div className="marquee-track">
          {[...items, ...items, ...items, ...items].map((item, idx) => (
            <div key={idx} className="marquee-item">
              <span className="text-yellow-400 text-lg"></span>
              <span className="text-white text-xl font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        .marquee-track {
          display: flex;
          gap: 3rem;
          animation: scroll 25s linear infinite;
          width: max-content;
        }
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

// ============ FEATURES COMPONENT ============
const Features = () => {
  const features = [
    { icon: "REPLY:", title: "SMS & Voice Support", desc: "Workers text or send voice memos in any language. No app downloads, no training required—just instant answers via SMS." },
    { icon: "", title: "10+ Languages", desc: "Sidekick understands and responds in Spanish, Korean, Mandarin, Vietnamese, and more. Every worker gets help in their preferred language." },
    { icon: "SHEET", title: "Gap Detection & Insights", desc: "AI identifies training gaps, trending questions, and suggests improvements—helping managers take action before small issues become big problems." },
  ];

  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.span variants={fadeInUp} className="text-sm font-medium text-[#1A1615] mb-4 block"> Why Sidekick</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl font-serif text-[#1A1615]">Built for <span>Frontline Teams.</span></motion.h2>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="bg-[#F5F3F0]/80 rounded-3xl p-10 hover:shadow-lg transition-shadow">
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-semibold text-[#1A1615] mb-3">{feature.title}</h3>
              <p className="text-[#1A1615]/70">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ ABOUT COMPONENT ============
const About = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
            className="bg-gradient-to-b from-[#8BB8E0] via-[#C8D8E8] to-[#F2E6D9] rounded-[32px] p-8 relative"
          >
            <Image src="/images/about/about-1.webp" alt="Frontline workers" width={653} height={675} className="rounded-2xl" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-12 left-12 bg-[#1A1615] rounded-2xl p-6"
            >
              <span className="text-yellow-400 text-xs uppercase tracking-wider block mb-2">Results</span>
              <div className="text-white text-5xl font-bold">70%</div>
              <p className="text-white/80 text-sm mt-2">Faster time to productivity for new hires</p>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-sm font-medium text-[#1A1615] mb-4 block"> The Problem We Solve</motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl font-serif text-[#1A1615] mb-6">80% of workers don't sit at a desk. Onboarding them shouldn't be <span>this hard.</span></motion.h2>
            <motion.p variants={fadeInUp} className="text-[#1A1615]/80 mb-4">Frontline workers in manufacturing, retail, and logistics are constantly interrupting managers with the same questions. Paper handbooks get lost. Training videos get skipped. And turnover keeps climbing.</motion.p>
            <motion.p variants={fadeInUp} className="text-[#1A1615]/80 mb-8">Sidekick changes that. Workers simply text their questions and get instant, accurate answers from your company documents—in any language, 24/7.</motion.p>
            <motion.a variants={fadeInUp} href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="text-[#1A1615] font-medium hover:text-blue-500 transition-colors inline-flex items-center gap-2">
              See How It Works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
            
            <motion.div variants={fadeInUp} className="mt-8 bg-[#F5F3F0]/90 rounded-3xl p-8">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xl"></span>)}
              </div>
              <p className="text-[#1A1615] mb-6">"Sidekick cut our onboarding time in half. New hires used to interrupt managers constantly—now they just text and get instant answers."</p>
              <div>
                <h6 className="font-semibold text-[#1A1615]">Chris Kim</h6>
                <span className="text-[#1A1615]/70 text-sm">Owner, EDS Manufacturing</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============ PORTFOLIO / TWO VIEWS COMPONENT ============
const Portfolio = () => {
  const portfolioItems = [
    { 
      badge: "Worker View", 
      badgeColor: "bg-yellow-400 text-black", 
      title: "SMS Q&A Interface", 
      desc: "Text any question, get instant answers sourced from company documents",
      gradient: "from-blue-600 to-blue-800"
    },
    { 
      badge: "Manager View", 
      badgeColor: "bg-green-500 text-white", 
      title: "Analytics Dashboard", 
      desc: "Track what questions workers ask most and identify training gaps",
      gradient: "from-emerald-600 to-emerald-800"
    },
    { 
      badge: "Worker View", 
      badgeColor: "bg-yellow-400 text-black", 
      title: "Voice Memo Support", 
      desc: "Perfect for workers who prefer speaking over typing",
      gradient: "from-purple-600 to-purple-800"
    },
    { 
      badge: "Manager View", 
      badgeColor: "bg-green-500 text-white", 
      title: "Gap Detection & Suggestions", 
      desc: "Proactively improve training before problems arise",
      gradient: "from-orange-600 to-orange-800"
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#8BB8E0] via-[#B8D0E8] to-[#F2E6D9] rounded-[32px] mx-4 my-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-12"
        >
          <motion.span variants={fadeInUp} className="text-sm font-medium text-[#1A1615] mb-4 block"> See It In Action</motion.span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <motion.h2 variants={fadeInUp} className="text-4xl font-serif text-[#1A1615]">Two Views. One <span>Platform.</span></motion.h2>
            <motion.p variants={fadeInUp} className="text-[#1A1615]/80 max-w-md">Workers get instant answers via text. Managers get insights and analytics to improve onboarding.</motion.p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6"
        >
          {portfolioItems.map((item, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeInUp} 
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${item.gradient} aspect-[4/3] group cursor-pointer`}
            >
              {/* Overlay pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className={`${item.badgeColor} text-sm font-medium px-4 py-1 rounded-full w-fit mb-4`}>
                  {item.badge}
                </span>
                <h3 className="text-white text-2xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ TESTIMONIALS COMPONENT ============
const Testimonials = () => {
  const testimonials = [
    { quote: "Sidekick cut our onboarding time in half. New hires used to interrupt managers constantly with the same questions—now they just text and get instant answers. It's been a game-changer for productivity.", name: "Chris Kim", title: "Owner, EDS Manufacturing", logo: "/images/testimonial/eds-logo.png" },
    { quote: "Our employees speak five different languages. Before Sidekick, training was a nightmare—we'd have to translate everything or find bilingual supervisors. Now everyone just texts in their own language and gets help instantly.", name: "Kishore Muvva", title: "Owner, Trinethra Supermarket", logo: "/images/testimonial/trinethra-logo.png" },
    { quote: "The gap detection feature is incredible. Sidekick showed us that 40% of questions were about our PTO policy—turns out our handbook was confusing. We fixed it in a day and those questions dropped to near zero.", name: "Jim Falk", title: "Owner, Jim Falk Motors", logo: "/images/testimonial/jfm-logo.png" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.span variants={fadeInUp} className="text-sm font-medium text-[#1A1615] mb-4 block"> What Our Customers Say</motion.span>
          <motion.h2 variants={fadeInUp} className="text-4xl font-serif text-[#1A1615]">Trusted by Frontline Teams Everywhere.</motion.h2>
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="bg-white rounded-2xl p-10 border border-gray-100 flex flex-col min-h-[350px] hover:shadow-lg transition-shadow">
              <svg className="w-12 h-12 text-blue-500 mb-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7H7C5.89543 7 5 7.89543 5 9V13C5 14.1046 5.89543 15 7 15H9C9 16.6569 7.65685 18 6 18V20C8.76142 20 11 17.7614 11 15V7Z"/>
                <path d="M20 7H16C14.8954 7 14 7.89543 14 9V13C14 14.1046 14.8954 15 16 15H18C18 16.6569 16.6569 18 15 18V20C17.7614 20 20 17.7614 20 15V7Z"/>
              </svg>
              <p className="text-[#1A1615] text-lg leading-relaxed mb-8 flex-1">"{t.quote}"</p>
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-4">
                  <img src={t.logo} alt={t.name} className="w-14 h-14 object-contain" />
                  <div>
                    <h5 className="font-semibold text-[#1A1615]">{t.name}</h5>
                    <span className="text-[#1A1615]/70 text-sm">{t.title}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ FAQ COMPONENT ============
const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);
  const faqs = [
    { q: "How does Sidekick work?", a: "Workers simply text their questions to Sidekick's phone number. Our AI reads your company documents (handbooks, SOPs, policies) and responds with accurate answers in seconds—in any language. No app downloads or training required." },
    { q: "What languages does Sidekick support?", a: "Sidekick supports 10+ languages including Spanish, Korean, Mandarin, Vietnamese, Tagalog, and more. Workers can text or send voice memos in their native language and receive responses in the same language." },
    { q: "How do I set up Sidekick for my team?", a: "Setup takes less than 30 minutes. Simply upload your company documents (PDFs, Word docs, or paste text), and Sidekick automatically learns your policies. Then share the phone number with your team—that's it!" },
    { q: "What kind of questions can workers ask?", a: "Anything covered in your company documents: PTO policies, safety procedures, benefits information, dress code, clock-in procedures, equipment instructions, and more. If it's in your docs, Sidekick can answer it." },
    { q: "How does the manager dashboard work?", a: "Managers get a real-time dashboard showing trending questions, knowledge gaps, and AI-suggested improvements. You can see what topics confuse new hires most and proactively update your training materials." },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
            className="bg-[#F5F3F0]/90 rounded-[32px] p-10 h-fit"
          >
            <span className="text-sm font-medium text-[#1A1615] mb-4 block"> Common Questions</span>
            <h2 className="text-4xl font-serif text-[#1A1615] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#1A1615]/70 mb-8">Everything you need to know about Sidekick. Can't find the answer you're looking for? Book a demo and we'll walk you through it.</p>
            <a href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="inline-flex bg-[#1A1615] text-white px-7 py-3 rounded-full font-medium hover:bg-blue-500 transition-colors">
              Book a Demo
            </a>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <button className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}>
                  <span className="font-medium text-[#1A1615]">{faq.q}</span>
                  <span className="text-2xl text-[#1A1615] ml-4">{openIdx === idx ? '−' : '+'}</span>
                </button>
                {openIdx === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-6 pb-5 text-[#1A1615]/70"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============ CTA COMPONENT ============
const CTA = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-[#8BB8E0] via-[#B8D0E8] to-[#F2E6D9] rounded-[32px] py-20 px-10 text-center"
        >
          <h2 className="text-5xl font-serif text-[#1A1615] mb-6">Ready to transform your onboarding?</h2>
          <p className="text-[#1A1615]/80 text-lg mb-8">Book a 15-minute demo and see Sidekick in action.</p>
          <a href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="inline-flex bg-[#1A1615] text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-500 transition-all hover:-translate-y-1 hover:shadow-lg">
            Book a Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
};

// ============ FOOTER COMPONENT ============
const Footer = () => {
  return (
    <footer className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-12">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-5">
                <Image src="/images/logo/sidekick-logo.png" alt="Sidekick" width={32} height={32} />
                <span className="text-xl font-semibold text-[#1A1615]">Sidekick</span>
              </Link>
              <p className="text-[#1A1615]/70 text-sm mb-5">The AI SMS assistant that helps frontline workers get instant answers in any language.</p>
            </div>
            
            <div>
              <h6 className="text-xs font-semibold uppercase tracking-wider text-[#1A1615] mb-5">Pages</h6>
              <ul className="space-y-3">
                <li><Link href="/" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">Home</Link></li>
                <li><Link href="/about" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">About</Link></li>
                <li><Link href="/contact" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h6 className="text-xs font-semibold uppercase tracking-wider text-[#1A1615] mb-5">Legal</h6>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">Terms of Service</Link></li>
                <li><Link href="/sms-terms" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">SMS Terms</Link></li>
                <li><Link href="/sms-consent" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">SMS Consent</Link></li>
              </ul>
            </div>
            
            <div>
              <h6 className="text-xs font-semibold uppercase tracking-wider text-[#1A1615] mb-5">Product</h6>
              <ul className="space-y-3">
                <li><a href="/manager" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">Manager Portal</a></li>
                <li><a href="/onboarding" className="text-[#1A1615]/70 text-sm hover:text-[#1A1615]">Onboarding</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="text-xs font-semibold uppercase tracking-wider text-[#1A1615] mb-5">Get Started</h6>
              <p className="text-[#1A1615]/70 text-sm mb-5">Book a 15-minute demo and see Sidekick in action.</p>
              <a href="https://cal.com/justin-so-xnr0oc/sidekick-demo" target="_blank" className="inline-flex bg-[#1A1615] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-500 transition-colors">
                Book a Demo
              </a>
            </div>
          </div>
          
          <div className="border-t border-[#1A1615]/10 mt-8 pt-8 flex flex-wrap justify-between items-center gap-4">
            <p className="text-[#1A1615]/70 text-sm">© 2025 Sidekick. All rights reserved.</p>
            <p className="text-[#1A1615]/70 text-sm">hello@textsidekick.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============ MAIN PAGE ============
export default function Home() {
  return (
    <div className="bg-gradient-to-b from-[#F5F3F0] to-white min-h-screen">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <About />
        <Portfolio />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
