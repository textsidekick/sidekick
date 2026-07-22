import { HotelSidebar } from "@/components/hotel/HotelSidebar";

export const metadata = {
  title: "Sidekick Hotels",
  description: "Hotel operations OS prototype",
};

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F5", color: "#18222C" }}>
      <HotelSidebar />
      <main className="lg:ml-[250px]">{children}</main>
    </div>
  );
}
