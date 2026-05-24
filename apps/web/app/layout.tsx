import { Inter, JetBrains_Mono } from "next/font/google";

import "@aseanflow/ui/globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/layout/navigation";
import { Toaster } from "@aseanflow/ui";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <Providers>
          <Navigation />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
