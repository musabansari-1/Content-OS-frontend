import "./globals.css";
import "../styles.css";
import App from "../App";

export const metadata = {
  title: "ContentOS",
  description: "Create and manage content assets across platforms.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <App />
      </body>
    </html>
  );
}
