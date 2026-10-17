import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter,Manrope } from 'next/font/google'
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

export const metadata: Metadata = {
  title: "Abricot- Gestion de tâches",
  description: "Gestion des tâches",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body>
          <main>{children}</main>
      </body>
    </html>
  );
}
