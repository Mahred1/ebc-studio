// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import type { Metadata } from "next";
import { Inter, Noto_Serif_Georgian, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Noto_Serif_Georgian({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EBC Studio – Reserve Your Television Spot",
  description:
    "Reserve a recording session at Ethiopian Broadcasting Corporation studios. Browse available channels and book your spot online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        {children}
        <Toaster
          theme="light"
          position="bottom-right"
          richColors
          closeButton
          offset={24}
          toastOptions={{ style: { boxShadow: "var(--shadow-sm)" } }}
        />
      </body>
    </html>
  );
}