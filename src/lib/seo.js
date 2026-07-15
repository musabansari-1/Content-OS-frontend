import { APP_NAME, SUPPORT_EMAIL } from "./appConstants";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://contentburst.app";

export const SITE_TITLE = "Content Burst";
export const SITE_DESCRIPTION =
  "Turn one YouTube video into platform-native assets that drive traffic back to the original video.";
export const OG_IMAGE_PATH = "/og-image-v2.png";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

export const SEO_KEYWORDS = [
  "Content Burst",
  "AI content repurposing",
  "YouTube content repurposing",
  "creator content workflow",
  "social media content generator",
  "platform-native content",
  "content distribution",
  "LinkedIn post generator",
  "newsletter generator",
  "short-form content workflow",
];

export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/support", priority: 0.4, changeFrequency: "monthly" },
];

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildSeoMetadata({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  path = "/",
  imageUrl = OG_IMAGE_URL,
  imageAlt = SITE_TITLE,
  noIndex = false,
} = {}) {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: SEO_KEYWORDS,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: APP_NAME,
        url: SITE_URL,
        email: SUPPORT_EMAIL,
        logo: OG_IMAGE_URL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: APP_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: APP_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        image: OG_IMAGE_URL,
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };
}
