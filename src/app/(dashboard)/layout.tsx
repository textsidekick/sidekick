import { Inter, Instrument_Serif } from "next/font/google";
import "../globals.css";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sidekick | Ops Dashboard",
  description: "Your frontline team's operating memory.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`antialiased`}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#F5F5F4",
          color: "#1C1A16",
        }}
      >
        <Sidebar />
        <div className="lg:ml-[220px]">
          {children}
        </div>
      </body>
    </html>
  );
}
