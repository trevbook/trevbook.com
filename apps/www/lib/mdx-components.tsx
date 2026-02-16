import type { AnchorHTMLAttributes } from "react";
import { Figure } from "@/components/figure";
import { ImageCarousel } from "@/components/image-carousel";
import { TableOfContents } from "@/components/table-of-contents";
import { ZoomImage } from "@/components/zoom-image";

function MdxLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = props.href && !props.href.startsWith("#") && !props.href.startsWith("/");
  return <a {...props} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} />;
}

export const mdxComponents = {
  img: ZoomImage,
  a: MdxLink,
  Figure,
  ImageCarousel,
  TableOfContents,
};
