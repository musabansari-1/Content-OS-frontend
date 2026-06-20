import BillingRoute from "../../components/routes/BillingRoute";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata = buildSeoMetadata({
  title: "Billing",
  description: "Manage your private Content Burst billing settings.",
  path: "/billing",
  noIndex: true,
});

export default function Page() {
  return <BillingRoute />;
}
