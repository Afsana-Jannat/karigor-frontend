import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

// Bangla needs the bengali subset. This is the main font of the site.
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karigor | আপনার এলাকার বিশ্বস্ত কারিগর",
  description:
    "আপনার কাজের জন্য কারিগর খুঁজুন, প্রস্তাব তুলনা করুন এবং নিজের পছন্দে উপযুক্ত কারিগর বেছে নিন।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={cn(
        "h-full",
        "antialiased",
        notoSansBengali.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}