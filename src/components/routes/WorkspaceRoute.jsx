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
        generationGroups={app.generationGroups}
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
        onPublishGhost={app.handlePublishGhostAsset}
        ghostPublishStatus={app.ghostPublishStatus}
        ghostPublishError={app.ghostPublishError}
        ghostPublishResult={app.ghostPublishResult}
        onPublishYouTube={app.handlePublishYouTubeAsset}
        youtubePublishStatus={app.youtubePublishStatus}
        youtubePublishError={app.youtubePublishError}
        youtubePublishResult={app.youtubePublishResult}
        connectedPlatformIds={app.connectedPlatformIds}
        integrationStatus={app.integrationStatus}
        onScheduleAsset={app.handleScheduleAsset}
        scheduleStatus={app.scheduleStatus}
        scheduleError={app.scheduleError}
        scheduleResult={app.scheduleResult}
        scheduledPosts={app.scheduledPosts}
        scheduledPostsStatus={app.scheduledPostsStatus}
        scheduledPostsError={app.scheduledPostsError}
        onCancelScheduledPost={app.handleCancelScheduledPost}
        cancelScheduledPostId={app.cancelScheduledPostId}
        cancelScheduledPostError={app.cancelScheduledPostError}
        onExportWorkspace={app.handleExportWorkspace}
        saveStatus={app.workspaceSaveStatus}
        selectedAsset={app.selectedAsset}
        lastGeneratedCount={app.lastGeneratedCount}
        onGoToIntegrations={() => router.push("/integrations")}
        onGoToMain={() => router.push("/")}
      />
    </AppFrame>
  );
}
