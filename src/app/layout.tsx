import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/layout/AuthProvider";
import Navigation from "@/components/layout/Navigation";
import ToastContainer from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Moxn — Your Digital Cookbook",
  description:
    "Discover, create, and share recipes. Smart scaling, hands-free cooking mode, and a beautiful cookbook experience.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#D65A31",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <main className="min-h-screen pb-20 md:pb-0">{children}</main>
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
