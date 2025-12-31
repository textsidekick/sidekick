import Link from "next/link";

// Hero Illustration Component - extracted from Figma
function HeroIllustration() {
  return (
    <div className="w-72 h-72 md:w-96 md:h-96 relative scale-75 md:scale-100">
      <div className="w-20 h-11 left-[196px] top-[229.62px] absolute bg-neutral-200" />
      <div className="w-16 h-10 left-[74.16px] top-[243.31px] absolute bg-neutral-200" />
      <div className="w-32 h-20 left-0 top-[160.17px] absolute bg-neutral-200" />
      <div className="w-28 h-32 left-[26.15px] top-[39.36px] absolute opacity-10 bg-green-950" />
      <div className="w-16 h-16 left-[45.61px] top-[158.74px] absolute bg-gray-700" />
      <div className="w-2.5 h-10 left-[45.60px] top-[176.47px] absolute bg-gray-800" />
      <div className="w-14 h-14 left-[48.22px] top-[163.09px] absolute bg-slate-600" />
      <div className="w-11 h-12 left-[48.22px] top-[163.09px] absolute opacity-20 bg-green-950" />
      <div className="w-32 h-48 left-[0.59px] top-[36.01px] absolute bg-gray-700" />
      <div className="w-32 h-44 left-[5.63px] top-[39.36px] absolute bg-slate-600" />
      <div className="w-32 h-40 left-[9.19px] top-[45.45px] absolute bg-green-500" />
      <div className="w-32 h-40 left-[9.19px] top-[45.45px] absolute opacity-75 bg-white" />
      <div className="w-2 h-28 left-[0.56px] top-[110.76px] absolute bg-gray-800" />
      <div className="w-3 h-2 left-[64.14px] top-[175.75px] absolute bg-green-500" />
      <div className="w-32 h-40 left-[23.63px] top-[1.66px] absolute bg-slate-50" />
      <div className="w-[3.11px] h-20 left-[20.92px] top-[79.52px] absolute bg-slate-50" />
      <div className="w-32 h-40 left-[23.34px] top-[1.35px] absolute bg-neutral-200" />
      <div className="w-32 h-20 left-[20.94px] top-0 absolute bg-green-500" />
      <div className="w-32 h-20 left-[20.94px] top-0 absolute opacity-20 bg-green-950" />
      <div className="w-32 h-20 left-[23.34px] top-[1.36px] absolute bg-green-500" />
      <div className="w-0.5 h-1 left-[134.54px] top-[10.05px] absolute bg-slate-50" />
      <div className="w-0.5 h-1 left-[138.71px] top-[7.61px] absolute bg-slate-50" />
      <div className="w-0.5 h-1 left-[142.92px] top-[5.17px] absolute bg-slate-50" />
      <div className="w-32 h-20 left-[21.52px] top-0 absolute bg-green-500" />
      <div className="w-32 h-20 left-[21.52px] top-0 absolute opacity-50 bg-white" />
      {/* Calendar/document details */}
      <div className="w-8 h-5 left-[53.48px] top-[94.10px] absolute bg-slate-600" />
      <div className="w-8 h-6 left-[53.48px] top-[111.23px] absolute bg-slate-600" />
      {/* Green accent squares */}
      <div className="w-2.5 h-2.5 left-[48.54px] top-[67.80px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[48.50px] top-[82.41px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[48.50px] top-[82.41px] absolute opacity-60 bg-white" />
      <div className="w-2.5 h-3 left-[65.17px] top-[72.78px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[65.17px] top-[72.78px] absolute opacity-60 bg-white" />
      <div className="w-2.5 h-3 left-[65.17px] top-[91.45px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[65.17px] top-[91.45px] absolute opacity-60 bg-white" />
      <div className="w-2.5 h-3 left-[65.17px] top-[109.77px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[65.17px] top-[109.77px] absolute opacity-60 bg-white" />
      <div className="w-2.5 h-3 left-[81.40px] top-[100.40px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[81.40px] top-[100.40px] absolute opacity-60 bg-white" />
      <div className="w-2.5 h-3 left-[81.38px] top-[116.98px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[81.38px] top-[116.98px] absolute opacity-60 bg-white" />
      <div className="w-2.5 h-3 left-[48.50px] top-[101.07px] absolute bg-green-500" />
      <div className="w-2.5 h-3 left-[48.50px] top-[101.07px] absolute opacity-60 bg-white" />
      <div className="w-2 h-3 left-[82.02px] top-[62.40px] absolute bg-slate-600" />
      <div className="w-2 h-2.5 left-[82.28px] top-[82.74px] absolute bg-green-200" />
      <div className="w-2 h-2.5 left-[49.40px] top-[120.05px] absolute bg-green-200" />
      {/* Right side building/screen */}
      <div className="w-14 h-32 left-[107.06px] top-[18.04px] absolute bg-slate-600" />
      <div className="w-14 h-32 left-[107.11px] top-[18.04px] absolute bg-slate-600" />
      <div className="w-14 h-32 left-[107.06px] top-[18.04px] absolute opacity-80 bg-slate-600" />
      <div className="w-16 h-11 left-[104.42px] top-[16.52px] absolute bg-green-500" />
      <div className="w-14 h-11 left-[107.09px] top-[18.07px] absolute bg-green-500" />
      <div className="w-16 h-9 left-[105.08px] top-[16.55px] absolute opacity-40 bg-white" />
      <div className="w-[3.27px] h-2.5 left-[104.44px] top-[50.09px] absolute opacity-20 bg-green-950" />
      <div className="w-0.5 h-1 left-[152.70px] top-[27.08px] absolute bg-slate-600" />
      <div className="w-0.5 h-1 left-[156.91px] top-[24.65px] absolute bg-slate-600" />
      <div className="w-0.5 h-1 left-[161.12px] top-[22.22px] absolute bg-slate-600" />
      <div className="w-[3.37px] h-20 left-[104.48px] top-[58.89px] absolute bg-gray-700" />
      {/* Green UI elements on right screen */}
      <div className="w-4 h-2.5 left-[112.21px] top-[48.80px] absolute bg-green-500" />
      <div className="w-4 h-2.5 left-[120.39px] top-[58.26px] absolute bg-green-200" />
      <div className="w-6 h-3.5 left-[120.39px] top-[70.69px] absolute bg-green-200" />
      <div className="w-6 h-3.5 left-[120.39px] top-[75.42px] absolute bg-green-200" />
      <div className="w-3 h-2 left-[150.02px] top-[41.68px] absolute bg-green-500" />
      <div className="w-7 h-4 left-[121.01px] top-[100.86px] absolute bg-green-500" />
      <div className="w-3 h-2 left-[150.02px] top-[93.71px] absolute bg-green-500" />
      <div className="w-9 h-5 left-[125.58px] top-[79.56px] absolute bg-green-500" />
      <div className="w-11 h-7 left-[116.90px] top-[84.29px] absolute bg-green-500" />
      <div className="w-8 h-5 left-[118.96px] top-[96.12px] absolute bg-green-100" />
      <div className="w-7 h-4 left-[112.19px] top-[59.68px] absolute bg-green-500" />
      <div className="w-7 h-4 left-[112.19px] top-[59.68px] absolute opacity-60 bg-white" />
      {/* Folder/file stack on left */}
      <div className="w-5 h-10 left-[13.51px] top-[158.37px] absolute opacity-10 bg-green-950" />
      <div className="w-4 h-4 left-[13.51px] top-[109.94px] absolute opacity-10 bg-green-950" />
      <div className="w-4 h-4 left-[13.51px] top-[127.28px] absolute opacity-10 bg-green-950" />
      <div className="w-4 h-4 left-[13.51px] top-[144.64px] absolute opacity-10 bg-green-950" />
      <div className="w-6 h-10 left-[16.05px] top-[159.22px] absolute bg-green-500" />
      <div className="w-1 h-7 left-[16.05px] top-[171.69px] absolute opacity-20 bg-green-950" />
      <div className="w-6 h-3.5 left-[16.27px] top-[159.26px] absolute opacity-50 bg-white" />
      <div className="w-5 h-10 left-[19.19px] top-[161.12px] absolute bg-green-500" />
      <div className="w-1.5 h-3 left-[20.53px] top-[176.69px] absolute bg-white" />
      <div className="w-1.5 h-5 left-[26.94px] top-[170.64px] absolute bg-white" />
      <div className="w-1.5 h-3 left-[34.23px] top-[171.71px] absolute bg-white" />
      {/* Green folder tabs */}
      <div className="w-2 h-2.5 left-[7.69px] top-[53.16px] absolute bg-green-500" />
      <div className="w-2 h-2.5 left-[7.69px] top-[53.16px] absolute opacity-40 bg-green-950" />
      <div className="w-2 h-4 left-[8.76px] top-[53.78px] absolute bg-green-500" />
      <div className="w-2 h-4 left-[8.76px] top-[53.78px] absolute opacity-20 bg-green-950" />
      <div className="w-2 h-2.5 left-[7.69px] top-[61.50px] absolute bg-green-500" />
      <div className="w-2 h-2.5 left-[7.69px] top-[61.50px] absolute opacity-40 bg-green-950" />
      <div className="w-2 h-4 left-[8.76px] top-[62.11px] absolute bg-green-500" />
      <div className="w-2 h-4 left-[8.76px] top-[62.11px] absolute opacity-20 bg-green-950" />
      <div className="w-2 h-2.5 left-[7.69px] top-[69.81px] absolute bg-green-500" />
      <div className="w-2 h-2.5 left-[7.69px] top-[69.81px] absolute opacity-40 bg-green-950" />
      <div className="w-2 h-4 left-[8.76px] top-[70.43px] absolute bg-green-500" />
      <div className="w-2 h-4 left-[8.76px] top-[70.43px] absolute opacity-20 bg-green-950" />
      {/* Camera/device on right */}
      <div className="w-2 h-3 left-[88.01px] top-[22.74px] absolute bg-zinc-800" />
      <div className="w-[1.48px] h-2 left-[88.01px] top-[26.38px] absolute bg-zinc-800" />
      <div className="w-2 h-1 left-[88.08px] top-[22.76px] absolute opacity-40 bg-white" />
      <div className="w-[3.13px] h-[3.05px] left-[86.16px] top-[28.93px] absolute bg-gray-700" />
      <div className="w-[3.13px] h-[3.05px] left-[86.16px] top-[28.93px] absolute opacity-40 bg-white" />
      <div className="w-2 h-3 left-[87.32px] top-[23.48px] absolute bg-gray-700" />
      <div className="w-1 h-1.5 left-[90.50px] top-[25.97px] absolute bg-slate-50" />
      {/* Bottom platforms */}
      <div className="w-1.5 h-2 left-[116.80px] top-[116.65px] absolute bg-gray-800" />
      <div className="w-1.5 h-2.5 left-[116.80px] top-[114.37px] absolute bg-gray-700" />
      <div className="w-3 h-1 left-[98.56px] top-[118.05px] absolute bg-gray-800" />
      <div className="w-3 h-1.5 left-[98.57px] top-[114.14px] absolute bg-gray-700" />
      <div className="w-5 h-11 left-[104.08px] top-[72.19px] absolute bg-slate-600" />
      <div className="w-1.5 h-4 left-[105.69px] top-[79.36px] absolute bg-gray-700" />
      {/* Person on right with green/red outfit */}
      <div className="w-6 h-3.5 left-[84.08px] top-[50.64px] absolute bg-green-100" />
      <div className="w-2.5 h-2.5 left-[97.97px] top-[54.43px] absolute bg-slate-600" />
      <div className="w-[3.43px] h-1 left-[85.33px] top-[53.33px] absolute bg-green-200" />
      <div className="w-4 h-6 left-[104.16px] top-[54.09px] absolute bg-green-500" />
      <div className="w-3 h-3 left-[104.89px] top-[39.74px] absolute bg-gray-700" />
      <div className="w-3 h-3.5 left-[106.04px] top-[42.94px] absolute bg-green-100" />
      <div className="w-1 h-[2.74px] left-[109.86px] top-[51.03px] absolute bg-green-200" />
      <div className="w-4 h-6 left-[108.87px] top-[55.17px] absolute bg-green-100" />
      <div className="w-2 h-3 left-[117.15px] top-[55.09px] absolute bg-slate-600" />
      {/* Monitor/chart display */}
      <div className="w-6 h-2 left-[90.93px] top-[72.87px] absolute bg-green-500" />
      <div className="w-6 h-2 left-[90.93px] top-[72.87px] absolute opacity-50 bg-white" />
      <div className="w-6 h-2 left-[90.93px] top-[72.87px] absolute opacity-10 bg-green-950" />
      <div className="w-6 h-3.5 left-[90.92px] top-[67.72px] absolute bg-green-500" />
      <div className="w-6 h-3.5 left-[90.92px] top-[67.72px] absolute opacity-90 bg-white" />
      <div className="w-4 h-2.5 left-[92.73px] top-[70.37px] absolute bg-green-500" />
      <div className="w-4 h-2.5 left-[92.73px] top-[70.37px] absolute opacity-60 bg-white" />
      <div className="w-4 h-5 left-[88.49px] top-[62.63px] absolute bg-green-500" />
      <div className="w-4 h-5 left-[88.49px] top-[62.63px] absolute opacity-40 bg-white" />
      <div className="w-4 h-5 left-[88.75px] top-[62.49px] absolute bg-green-500" />
      <div className="w-4 h-5 left-[88.75px] top-[62.49px] absolute opacity-60 bg-white" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-24 py-3 bg-white shadow-[0px_4px_8px_0px_rgba(171,190,209,0.40)] flex justify-center items-center gap-11 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-6 h-4 relative">
            <div className="w-2.5 h-2 left-[4.56px] top-[8.57px] absolute bg-gray-800" />
            <div className="w-2.5 h-2 left-[14.84px] top-0 absolute bg-gray-800" />
            <div className="w-2 h-2 left-0 top-0 absolute bg-green-500" />
            <div className="w-2 h-2 left-[5.13px] top-[0.63px] absolute bg-green-500" />
            <div className="w-2 h-2 left-[10.20px] top-[9.35px] absolute bg-green-500" />
            <div className="w-2 h-2 left-[15.50px] top-[8.91px] absolute bg-green-500" />
          </div>
          <span className="text-gray-800 text-lg font-bold font-['Inter']">Sidekick</span>
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex items-start gap-4">
            <Link href="#features" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">Features</Link>
            <Link href="#demo" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">Demo</Link>
            <Link href="#pricing" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">Pricing</Link>
            <Link href="/about" className="text-neutral-600 text-sm font-medium font-['Inter'] leading-4 hover:text-green-500">About</Link>
          </div>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Try Demo</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-24 py-16 bg-slate-50 flex flex-col md:flex-row justify-start items-center gap-20">
        <div className="flex-1 flex flex-col justify-start items-start gap-6">
          <div className="flex flex-col justify-start items-start gap-3">
            <h1 className="text-3xl md:text-5xl font-semibold font-['Inter'] leading-tight md:leading-[53px]">
              <span className="text-neutral-600">Smart onboarding for </span>
              <span className="text-green-500">blue-collar teams</span>
            </h1>
            <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-5">
              AI-powered document intelligence that understands your workplace procedures. Workers text questions, get instant answers from company handbooks.
            </p>
          </div>
          <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm inline-flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
            <span className="text-white text-sm font-medium font-['Inter'] leading-4">Request Demo</span>
          </Link>
        </div>
        <HeroIllustration />
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-24 py-6 flex flex-col justify-start items-center gap-3">
        <div className="flex flex-col justify-start items-center gap-1.5">
          <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">Our Clients</h2>
          <p className="text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-4">Trusted by leading manufacturers and retailers</p>
        </div>
        <div className="h-16 flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <span className="text-lg font-bold text-gray-400 font-['Inter']">EDS Manufacturing</span>
          <span className="text-lg font-bold text-gray-400 font-['Inter']">Trinethra Supermarket</span>
          <span className="text-lg font-bold text-gray-300 border-2 border-dashed border-gray-200 px-4 py-2 rounded font-['Inter']">Your Company</span>
        </div>
      </section>

      {/* Value Prop */}
      <section className="px-6 md:px-24 py-8 flex flex-col justify-start items-center gap-3">
        <h2 className="max-w-md text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">
          Manage your entire onboarding <span className="text-green-500">in a single system</span>
        </h2>
        <p className="text-center text-neutral-500 text-sm font-normal font-['Inter'] leading-4">Who is Sidekick suitable for?</p>
      </section>

      {/* Features Cards */}
      <section id="features" className="px-6 md:px-24 py-4 flex flex-wrap justify-center gap-6">
        {[
          { icon: "🏭", title: "Manufacturing", desc: "Safety protocols, equipment SOPs, quality control procedures" },
          { icon: "🛒", title: "Retail", desc: "Store policies, inventory procedures, customer service guides" },
          { icon: "🔧", title: "Field Services", desc: "Service manuals, safety guidelines, client protocols" },
        ].map((item) => (
          <div key={item.title} className="w-52 px-6 py-4 bg-white rounded-md shadow-[0px_1.4px_2.8px_0px_rgba(171,190,209,0.20)] flex flex-col justify-start items-center gap-1.5">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="w-11 h-10 relative">
                <div className="w-9 h-9 absolute right-0 bottom-0 bg-green-100 rounded-tl-xl rounded-tr rounded-bl rounded-br-md" />
                <div className="w-8 h-8 absolute left-0 top-0 flex items-center justify-center text-2xl">{item.icon}</div>
              </div>
              <h3 className="text-center text-neutral-600 text-xl font-bold font-['Inter'] leading-6">{item.title}</h3>
            </div>
            <p className="w-44 text-center text-neutral-500 text-[10px] font-normal font-['Inter'] leading-3">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="px-6 md:px-24 py-11 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col justify-start items-start gap-1.5">
          <h2 className="text-2xl font-semibold font-['Inter'] leading-8">
            <span className="text-neutral-600">Helping businesses </span>
            <span className="text-green-500">reinvent onboarding</span>
          </h2>
          <p className="text-zinc-900 text-sm font-normal font-['Inter'] leading-4">We reached here with our hard work and dedication</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { value: "70%", label: "Faster Onboarding" },
            { value: "50%", label: "Fewer Incidents" },
            { value: "$15K", label: "Annual Savings" },
            { value: "95%", label: "Accuracy Rate" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                <div className="w-4 h-3 border-2 border-green-500 rounded-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-600 text-xl font-bold font-['Inter'] leading-6">{stat.value}</span>
                <span className="text-neutral-500 text-sm font-normal font-['Inter'] leading-4">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="px-6 md:px-24 py-12 flex flex-col items-center gap-8">
        <h2 className="text-center text-neutral-600 text-2xl font-semibold font-['Inter'] leading-8">Get Started in 3 Steps</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {[
            { num: "1", title: "Upload Documents", desc: "Drop your handbooks, manuals, and procedures" },
            { num: "2", title: "AI Classifies", desc: "Our AI automatically organizes everything" },
            { num: "3", title: "Workers Ask", desc: "Team texts questions, gets instant answers" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center max-w-xs">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold font-['Inter']">{step.num}</span>
              </div>
              <h3 className="text-neutral-600 text-lg font-bold font-['Inter'] leading-6 mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-sm font-normal font-['Inter'] leading-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 bg-slate-50 flex flex-col justify-start items-center gap-6">
        <h2 className="text-center text-gray-800 text-3xl md:text-5xl font-semibold font-['Inter'] leading-tight">Ready to transform your onboarding?</h2>
        <Link href="/qa" className="px-6 py-2.5 bg-green-500 rounded-sm inline-flex justify-center items-center gap-1.5 hover:bg-green-600 transition">
          <span className="text-white text-sm font-medium font-['Inter'] leading-4">Get a Demo</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-28 py-11 bg-gray-800 flex flex-col md:flex-row justify-start items-start gap-20">
        <div className="flex flex-col justify-start items-start gap-7">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-5 relative">
              <div className="w-3 h-2.5 absolute left-[2.71px] top-[10.59px] bg-white" />
              <div className="w-3 h-2.5 absolute left-[18.35px] top-0 bg-white" />
              <div className="w-2.5 h-2 absolute left-0 top-0 bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[6.34px] top-[0.78px] bg-green-500" />
              <div className="w-2.5 h-2.5 absolute left-[12.61px] top-[11.56px] bg-green-500" />
              <div className="w-2.5 h-2 absolute left-[19.16px] top-[11.01px] bg-green-500" />
            </div>
            <span className="text-white text-lg font-bold font-['Inter']">Sidekick</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3">Copyright © 2025 Sidekick AI.</p>
            <p className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3">All rights reserved</p>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-sm font-semibold font-['Inter'] leading-5">Company</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">About us</Link>
              <Link href="/contact" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">Contact us</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-white text-sm font-semibold font-['Inter'] leading-5">Support</h3>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">Terms of service</Link>
              <Link href="/privacy" className="text-slate-50 text-[10px] font-normal font-['Inter'] leading-3 hover:text-white">Privacy policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
