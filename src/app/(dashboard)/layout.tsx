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
  title: "Sidekick | Manager Dashboard",
  description: "Manage your frontline team with Sidekick.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <Sidebar />
        <div className="lg:ml-[220px]">
          {children}
        </div>
      </body>
    </html>
  );
}
