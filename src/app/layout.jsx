import "./globals.css";
import "../styles.css";
import { AppProvider } from "../components/app/AppProvider";
import { APP_NAME } from "../lib/appConstants";

export const metadata = {
  title: APP_NAME,
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
