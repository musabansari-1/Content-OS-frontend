import "./globals.css";
import "../styles.css";
import { AppProvider } from "../components/app/AppProvider";

export const metadata = {
  title: "ContentOS",
  description: "Create and manage content assets across platforms.",
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
