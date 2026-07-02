import { Inter, Instrument_Serif } from "next/font/google";
import "../globals.css";
import ManagerChat from "@/components/dashboard/ManagerChat";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { TopBar } from "@/components/dashboard/layout/TopBar";

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
  title: "Sidekick | Manager Dashboard",
  description: "Manage your frontline team with Sidekick.",
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
          background: "#F7F3EC",
          color: "#1C1A16",
        }}
      >
        <TopBar />
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <div style={{ marginLeft: 220, flex: 1 }}>
            {children}
          </div>
        </div>
        <ManagerChat />
      </body>
    </html>
  );
}
