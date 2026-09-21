import { ProjectOrbit } from "@/components/project-orbit";
import { LanguageToggle } from "@/components/language-toggle";

export default function Home() {
  return (
    <main className="portfolio-stage" aria-label="Portfolio d’Andrea Izzillo">
      <LanguageToggle />
      <ProjectOrbit />
      <p className="portfolio-slogan" lang="en">
        Turning a bunch of pixels into a
        <br />
        <em lang="fr">chef d’œuvre</em>
      </p>
    </main>
  );
}
