import manifest from "@/data/media.generated.json";

export type MediaAsset = {
  width: number;
  height: number;
  variants: readonly { src: string; width: number; height: number; bytes: number }[];
  video?: string;
};

export function getMedia(name: keyof typeof manifest): MediaAsset {
  return manifest[name];
}

export function mediaUrl(src: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}

export function imageSource(asset: MediaAsset, preferredWidth = 800) {
  const variant =
    asset.variants.find(({ width }) => width >= preferredWidth) ?? asset.variants.at(-1);
  if (!variant) throw new Error("A media asset must have at least one image variant.");
  return mediaUrl(variant.src);
}

export function imageSourceSet(asset: MediaAsset) {
  return asset.variants.map(({ src, width }) => `${mediaUrl(src)} ${width}w`).join(", ");
}
