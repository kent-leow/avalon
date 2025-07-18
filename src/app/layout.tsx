import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionExpirationProvider } from "~/components/providers/SessionExpirationProvider";
import { GlobalSSEProvider } from "~/context/GlobalSSEContext";

export const metadata: Metadata = {
  title: "Avalon - The Ultimate Online Experience",
  description: "The ultimate online experience for The Resistance: Avalon",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
      </head>
      <body>
        <TRPCReactProvider>
          <GlobalSSEProvider>
            <SessionExpirationProvider>
              {children}
            </SessionExpirationProvider>
          </GlobalSSEProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
