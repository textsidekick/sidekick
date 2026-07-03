import { Inter } from "next/font/google";
import "../globals.css";
import ManagerChat from "@/components/dashboard/ManagerChat";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`antialiased`}
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#F8F9FC",
          color: "#111827",
        }}
      >
        <Sidebar />
        <div className="lg:ml-[220px]">
          {children}
        </div>
        <ManagerChat />
      </body>
    </html>
  );
}
