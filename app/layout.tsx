import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Adventure — Prototype",
  description: "Prototype haute fidélité d’une application mobile d’apprentissage de l’anglais."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
