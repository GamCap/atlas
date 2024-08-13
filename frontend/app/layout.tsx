import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@xyflow/react/dist/style.css";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Atlas - Worldcoin Explorer by GamCap Labs",
  description: "",
};

const links = [
  { href: "/merkletree", label: "Merkle Tree" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""}
        />
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="min-h-screen h-screen flex flex-col justify-start grow bg-gradient-to-b from-light1 to-light2 dark:from-dark1 dark:to-dark2">
            <Header links={links} />
            <div className="container flex-1 px-1 lg:px-2 flex flex-col relative overflow-y-scroll scrollbar">
              {children}
            </div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
