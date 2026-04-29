import Link from "next/link";
import { SidekickLogo, YCBadge } from "./Brand";

export default function Footer() {
  return (
    <footer className="px-6 pt-20 pb-12 border-t border-ink/8 bg-cream">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <SidekickLogo size={30} />
              <span className="text-[18px] font-semibold tracking-tight">Sidekick</span>
            </Link>
            <p className="mt-4 text-[14px] leading-[1.55] text-ink/60 max-w-[320px]">
              The text-based assistant for frontline teams. Your binders,
              finally answering back.
            </p>
            <div className="mt-6">
              <YCBadge height={18} />
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              ["How it works", "#product"],
              ["Use cases", "#product"],
              ["Pricing", "#pricing"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["Blog", "https://textsidekick.substack.com/"],
              ["Contact", "#contact"],
              ["Email us", "mailto:hello@textsidekick.com"],
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              ["Terms", "/terms"],
              ["Privacy", "/privacy"],
            ]}
          />
        </div>

        <div className="mt-16 pt-8 border-t border-ink/8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[13px] text-ink/55">
          <span>© {new Date().getFullYear()} Sidekick HQ, Inc. All rights reserved.</span>
          <span>Made for the people who keep the floor running.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.12em] text-ink/45 font-semibold">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-[14px] text-ink/70">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="hover:text-ink"
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
