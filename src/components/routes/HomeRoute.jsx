"use client";

import { useRouter } from "next/navigation";
import AppFrame from "../app/AppFrame";
import HomePage from "../app/HomePage";
import { useAppState } from "../app/AppProvider";

export default function HomeRoute() {
  const app = useAppState();
  const router = useRouter();

  return (
    <AppFrame route="home">
      <HomePage
        profileMode={app.profileMode}
        setProfileMode={app.setProfileMode}
        sampleText={app.sampleText}
        setSampleText={app.setSampleText}
        youtubeText={app.youtubeText}
        youtubeTranscriptText={app.youtubeTranscriptText}
        profileStatus={app.profileStatus}
        profileError={app.profileError}
        voiceProfile={app.voiceProfile}
        onYoutubeProfileInputChange={app.setYoutubeProfileInput}
        onYoutubeProfileTranscriptChange={app.setYoutubeProfileTranscript}
        onSaveSamplesProfile={app.handleSaveSamplesProfile}
        onSaveYoutubeProfile={app.handleSaveYoutubeProfile}
        generateStatus={app.generateStatus}
        generateError={app.generateError}
        videoInput={app.videoInput}
        generateTranscript={app.generateTranscript}
        uploadedVideo={app.uploadedVideo}
        onGenerateVideoInputChange={app.setGenerateVideoInput}
        onGenerateTranscriptChange={app.setGenerateTranscriptInput}
        onGenerateUploadedVideoChange={app.setGenerateUploadedVideo}
        targetAssets={app.targetAssets}
        selectedAssets={app.selectedAssets}
        onAssetToggle={app.handleAssetToggle}
        onGenerate={app.handleGenerate}
        unavailableMessage={app.unavailableMessage}
        workspaceAssets={app.workspaceAssets}
        onGoToWorkspace={() => router.push("/workspace")}
      />
    </AppFrame>
  );
}
