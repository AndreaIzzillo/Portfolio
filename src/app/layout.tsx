import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DreamBackground } from "@/components/dream-background";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andrea Izzillo — Portfolio",
  description:
    "Portfolio d’Andrea Izzillo, étudiant à EPITA en majeure IMAGE : projets et réalisations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <DreamBackground />
        <LanguageProvider>
          <div className="site-content">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
