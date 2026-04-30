import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://textsidekick.com"),
  title: "Sidekick — Frontline answers, by text.",
  description:
    "Sidekick is the texting assistant for your frontline. Workers ask it anything — shift times, SOPs, safety steps, HR — and get instant answers from your own documents.",
  openGraph: {
    title: "Sidekick — Frontline answers, by text.",
    description:
      "The texting assistant for your frontline. One phone number, every answer your floor needs.",
    url: "https://textsidekick.com",
    siteName: "Sidekick",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sidekick — Frontline answers, by text.",
    description:
      "The texting assistant for your frontline. One phone number, every answer your floor needs.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="antialiased" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
