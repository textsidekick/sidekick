import { HotelSidebar } from "@/components/hotel/HotelSidebar";

export const metadata = {
  title: "Sidekick Hotels",
  description: "Hotel operations OS prototype",
};

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EC", color: "#1C1A16" }}>
      <HotelSidebar />
      <main className="lg:ml-[250px]">{children}</main>
    </div>
  );
}
