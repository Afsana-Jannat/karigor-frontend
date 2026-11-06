import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

export const metadata: Metadata = {
  title: "Karigor | আপনার এলাকার বিশ্বস্ত কারিগর",
  description:
    "আপনার কাজের জন্য কারিগর খুঁজুন, প্রস্তাব তুলনা করুন এবং নিজের পছন্দে উপযুক্ত কারিগর বেছে নিন।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
