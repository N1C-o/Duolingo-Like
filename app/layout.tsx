import type { Metadata } from "next";
import { ConvexProvider } from "@/components/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Adventure",
  description: "Une aventure locale et ludique pour apprendre l’anglais en cinq minutes.",
  applicationName: "English Adventure",
  formatDetection: { telephone: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><ConvexProvider>{children}</ConvexProvider></body>
    </html>
  );
}
