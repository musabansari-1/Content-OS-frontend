import "./globals.css";
import "../styles.css";
import { AppProvider } from "../components/app/AppProvider";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://yourdomain.app";
const ogImageUrl = `${siteUrl}/og-image-v2.png`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "10x your reach with 1x effort",
  description:
    "Turn one YouTube video into platform-native assets that drive traffic back to the original video.",
  openGraph: {
    title: "10x your reach with 1x effort",
    description:
      "Turn one YouTube video into platform-native assets that drive traffic back to the original video.",
    url: siteUrl,
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "10x your reach with 1x effort",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "10x your reach with 1x effort",
    description:
      "Turn one YouTube video into platform-native assets that drive traffic back to the original video.",
    images: [ogImageUrl],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
