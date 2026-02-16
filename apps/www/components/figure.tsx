import { ZoomImage } from "@/components/zoom-image";

interface FigureProps {
  src: string;
  alt: string;
  caption: string;
  className?: string;
}

export function Figure({ src, alt, caption, className }: FigureProps) {
  return (
    <figure className={`not-prose my-8 flex flex-col items-center ${className ?? ""}`}>
      <ZoomImage
        src={src}
        alt={alt}
        caption={caption}
        className="w-full rounded-lg md:w-auto md:max-w-full"
      />
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
