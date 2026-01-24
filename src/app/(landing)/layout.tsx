import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Sidekick | AI SMS Assistant for Frontline Workers",
  description: "The AI SMS assistant that lets frontline workers get instant answers via text or voice memo in any language.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif', margin: 0 }} className={plusJakarta.variable}>
        {children}
      </body>
    </html>
  );
}
