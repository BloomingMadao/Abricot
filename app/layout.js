import "./globals.css";

export const metadata = {
  title: "Abricot- Gestion de tâches",
  description: "Gestion des tâches",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
