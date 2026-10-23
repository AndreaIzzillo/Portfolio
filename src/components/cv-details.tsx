"use client";

import { BubbleDialog, type BubbleOrigin } from "@/components/bubble-dialog";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ResponsiveImage } from "@/components/responsive-image";
import { getCv } from "@/data/cv";
import { mediaUrl } from "@/lib/media";

export function CvDetails({
  origin,
  closing,
  onRequestClose,
  onDismiss,
}: {
  origin: BubbleOrigin;
  closing: boolean;
  onRequestClose: () => void;
  onDismiss: () => void;
}) {
  const { language, t } = useLanguage();
  const cv = getCv(language);
  const url = mediaUrl(cv.file);

  return (
    <BubbleDialog
      id="cv-details"
      labelledBy="cv-detail-title"
      className="cv-detail"
      origin={origin}
      closing={closing}
      onRequestClose={onRequestClose}
      onDismiss={onDismiss}
    >
      <header className="cv-detail__header">
        <div className="cv-detail__heading">
          <h2 id="cv-detail-title">{t.cvTitle}</h2>
          <a className="cv-detail__original" href={url} target="_blank" rel="noopener noreferrer">
            {t.openCv} <span aria-hidden="true">↗</span>
            <span className="sr-only"> ({t.newTab})</span>
          </a>
        </div>
        <a className="glass-link cv-detail__download" href={url} download>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
          </svg>
          {t.downloadCv}
        </a>
        <LanguageToggle inDialog />
        <button
          type="button"
          className="glass-control"
          aria-label={t.closeCv}
          onClick={onRequestClose}
          autoFocus
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </header>
      <div
        key={language}
        className="cv-detail__document"
        tabIndex={0}
        role="region"
        aria-label={t.cvPreview}
      >
        <ResponsiveImage
          asset={cv.preview}
          alt={t.cvPreview}
          sizes="(max-width: 700px) calc(100vw - 64px), min(830px, calc(100vw - 96px))"
          className="cv-detail__preview"
          priority
        />
      </div>
    </BubbleDialog>
  );
}
