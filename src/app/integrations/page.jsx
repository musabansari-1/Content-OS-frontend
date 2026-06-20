import IntegrationsRoute from "../../components/routes/IntegrationsRoute";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata = buildSeoMetadata({
  title: "Integrations",
  description: "Manage your private Content Burst publishing integrations.",
  path: "/integrations",
  noIndex: true,
});

export default function Page() {
  return <IntegrationsRoute />;
}
