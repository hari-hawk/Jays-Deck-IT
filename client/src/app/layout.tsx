import type { Metadata } from "next";
import { inter, jetbrainsMono } from "@/lib/fonts";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "JAYS DECK — TechJays IT Command Center",
  description: "Internal IT administration, asset management, and service desk platform for TechJays",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
