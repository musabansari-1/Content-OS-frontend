import { APP_NAME } from "../lib/appConstants";
import { SITE_DESCRIPTION, SITE_URL } from "../lib/seo";

export default function manifest() {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: SITE_DESCRIPTION,
    start_url: SITE_URL,
    display: "standalone",
    background_color: "#060b12",
    theme_color: "#ff8a3d",
  };
}
