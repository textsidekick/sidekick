import { HotelSidebar } from "@/components/hotel/HotelSidebar";

export const metadata = {
  title: "Sidekick Hotels",
  description: "Hotel operations OS prototype",
};

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FA", color: "#17202B" }}>
      <HotelSidebar />
      <main className="lg:ml-[250px]">{children}</main>
    </div>
  );
}
