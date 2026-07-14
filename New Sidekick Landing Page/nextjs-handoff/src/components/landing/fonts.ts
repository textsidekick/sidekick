import { Instrument_Serif, Plus_Jakarta_Sans, Quicksand } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const quicksand = Quicksand({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-quicksand",
});
