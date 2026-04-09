import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sidekick | AI SMS Assistant for Frontline Workers",
  description: "The AI SMS assistant that lets frontline workers get instant answers via text or voice memo in any language.",
  openGraph: {
    title: "Sidekick | AI SMS Assistant for Frontline Workers",
    description: "The AI SMS assistant that lets frontline workers get instant answers via text or voice memo in any language.",
    images: ["/og-image.png"],
    siteName: "Sidekick",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sidekick | AI SMS Assistant for Frontline Workers",
    description: "The AI SMS assistant that lets frontline workers get instant answers via text or voice memo in any language.",
    images: ["/og-image.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
