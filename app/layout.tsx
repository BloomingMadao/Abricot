import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abricot- Gestion de tâches",
  description: "Gestion des tâches",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
          <main>{children}</main>
      </body>
    </html>
  );
}
