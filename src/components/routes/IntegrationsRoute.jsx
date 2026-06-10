"use client";

import AppFrame from "../app/AppFrame";
import IntegrationsPage from "../../IntegrationsPage";

export default function IntegrationsRoute() {
  return (
    <AppFrame route="integrations">
      <IntegrationsPage />
    </AppFrame>
  );
}
