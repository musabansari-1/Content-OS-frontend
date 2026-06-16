"use client";

import { useRouter } from "next/navigation";
import AppFrame from "../app/AppFrame";
import { useAppState } from "../app/AppProvider";
import WorkspacePage from "../app/WorkspacePage";

export default function WorkspaceRoute() {
  const app = useAppState();
  const router = useRouter();

  return (
    <AppFrame route="workspace">
      <WorkspacePage
        assets={app.workspaceAssets}
        activeAssetId={app.activeAssetId}
        activeBlockId={app.activeBlockId}
        onSelectAsset={app.setActiveAssetId}
        onSelectAssetStatus={app.handleAssetStatusChange}
        onSelectBlock={app.setActiveBlockId}
        onBlurBlock={() => app.setActiveBlockId("")}
        onBlockChange={app.handleBlockChange}
        onRevertBlock={app.handleRevertBlock}
        onDeleteAsset={app.handleDeleteAsset}
        onStatusChange={app.handleAssetStatusChange}
        onPublishLinkedIn={app.handlePublishLinkedInAsset}
        linkedinPublishStatus={app.linkedinPublishStatus}
        linkedinPublishError={app.linkedinPublishError}
        linkedinPublishResult={app.linkedinPublishResult}
        onPublishInstagram={app.handlePublishInstagramAsset}
        instagramPublishStatus={app.instagramPublishStatus}
        instagramPublishError={app.instagramPublishError}
        instagramPublishResult={app.instagramPublishResult}
        onExportWorkspace={app.handleExportWorkspace}
        saveStatus={app.workspaceSaveStatus}
        selectedAsset={app.selectedAsset}
        lastGeneratedCount={app.lastGeneratedCount}
        onGoToMain={() => router.push("/")}
      />
    </AppFrame>
  );
}
