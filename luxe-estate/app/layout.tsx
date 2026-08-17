import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Luxe Estate | Discover Premium Properties",
  description: "Curated luxury properties, villas, apartments, and penthouses in prime locations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white antialiased selection:bg-[#006655] selection:text-white transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
