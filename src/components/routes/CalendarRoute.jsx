"use client";

import { useRouter } from "next/navigation";
import AppFrame from "../app/AppFrame";
import CalendarPage from "../app/CalendarPage";
import { useAppState } from "../app/AppProvider";

export default function CalendarRoute() {
  const app = useAppState();
  const router = useRouter();

  return (
    <AppFrame route="calendar">
      <CalendarPage
        rolloutPlans={app.rolloutPlans}
        generationGroups={app.generationGroups}
        plannerSaveStatus={app.plannerSaveStatus}
        rolloutScheduleStatus={app.rolloutScheduleStatus}
        rolloutScheduleError={app.rolloutScheduleError}
        rolloutScheduleResult={app.rolloutScheduleResult}
        scheduledPosts={app.scheduledPosts}
        scheduledPostsStatus={app.scheduledPostsStatus}
        scheduledPostsError={app.scheduledPostsError}
        connectedPlatformIds={app.connectedPlatformIds}
        integrationStatus={app.integrationStatus}
        assets={app.workspaceAssets}
        onCreateRolloutPlan={app.handleCreateRolloutPlan}
        onDeleteRolloutPlan={app.handleDeleteRolloutPlan}
        onScheduleRolloutPlan={app.handleScheduleRolloutPlan}
        onGoToIntegrations={() => router.push("/integrations")}
        onGoToWorkspace={() => router.push("/workspace")}
      />
    </AppFrame>
  );
}
