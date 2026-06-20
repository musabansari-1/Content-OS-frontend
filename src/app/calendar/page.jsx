import CalendarRoute from "../../components/routes/CalendarRoute";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata = buildSeoMetadata({
  title: "Calendar",
  description: "Your private Content Burst publishing calendar.",
  path: "/calendar",
  noIndex: true,
});

export default function Page() {
  return <CalendarRoute />;
}
