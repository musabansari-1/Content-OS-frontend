import "./globals.css";
import "../styles.css";
import { AppProvider } from "../components/app/AppProvider";
import {
  buildJsonLd,
  buildSeoMetadata,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "../lib/seo";

const rootSeoMetadata = buildSeoMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const metadata = {
  ...rootSeoMetadata,
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Content Burst",
  },
  applicationName: "Content Burst",
  manifest: "/manifest.webmanifest",
  authors: [{ name: "Content Burst" }],
  creator: "Content Burst",
  publisher: "Content Burst",
  category: "AI content repurposing",
};

export default function RootLayout({ children }) {
  const jsonLd = buildJsonLd();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
