import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider, LanguageProvider, AuthProvider } from "@/components/providers";
import { getValidLocale, COOKIE_NAME, DEFAULT_LOCALE } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Luxe Estate | Discover Premium Properties",
  description: "Curated luxury properties, villas, apartments, and penthouses in prime locations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawCookieLocale = cookieStore.get(COOKIE_NAME)?.value;
  const initialLocale = rawCookieLocale ? getValidLocale(rawCookieLocale) : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} className="h-full scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white antialiased selection:bg-[#006655] selection:text-white transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider initialLocale={initialLocale}>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


