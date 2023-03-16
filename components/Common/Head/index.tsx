import NextHead from "next/head";

export type HeadProps = {
  path: string;
  type?: "website" | "article" | "profile";
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
};
export default function Head({ path, type, title, description, image, noindex, children }: React.PropsWithChildren<HeadProps>) {
  if (!path.startsWith("/")) path = "/" + path;
  image ||= "/logo.png";

  return (
    <NextHead>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta key="title" name="title" content={title} />
      <meta key="description" name="description" content={description} />
      {/* Open Graph / Facebook */}
      <meta key="og:type" property="og:type" content={type || "website"} />
      <meta key="og:url" property="og:url" content={path} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      {image && <meta key="og:image" property="og:image" content={image} />}
      <meta key="og:locale" property="og:locale" content="en_us" />
      <meta key="og:site_name" property="og:site_name" content="RogueLibs" />
      {/* Twitter */}
      {/* {<meta key="twitter:site" property="twitter:site" content="@roguelibs" />} */} {/* Uncomment when there's a Twitter account */}
      <meta key="twitter:card" property="twitter:card" content="summary_large_image" />
      <meta key="twitter:url" property="twitter:url" content={path} />
      <meta key="twitter:title" property="twitter:title" content={title} />
      <meta key="twitter:description" property="twitter:description" content={description} />
      {image && <meta key="twitter:image" property="twitter:image" content={image} />}
      {/* Canonical link and icon */}
      <link key="link-canonical" href={path} rel="canonical" />
      <link key="link-favicon" rel="icon" href="/favicon.ico" />
      {/* Optional noindex directive */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {children}
    </NextHead>
  );
}
