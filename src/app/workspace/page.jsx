import WorkspaceRoute from "../../components/routes/WorkspaceRoute";
import { buildSeoMetadata } from "../../lib/seo";

export const metadata = buildSeoMetadata({
  title: "Workspace",
  description: "Your private Content Burst workspace.",
  path: "/workspace",
  noIndex: true,
});

export default function Page() {
  return <WorkspaceRoute />;
}
