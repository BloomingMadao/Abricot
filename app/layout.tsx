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

// title.template: each page gives its own title (e.g. "Tableau de bord"),
// the browser tab shows "Tableau de bord | Abricot".
// WCAG 2.4.2: every page has a title that says what it is about.
export const metadata: Metadata = {
  title: {
    default: "Abricot - Gestion de projets",
    template: "%s | Abricot",
  },
  description: "Abricot, l'application de gestion de projets collaboratifs : projets, tâches et commentaires",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      {/* No <main> here: each group layout ((auth), (protected)) has its own,
          so that the header and the footer stay OUTSIDE <main> */}
      <body>{children}</body>
    </html>
  );
}
