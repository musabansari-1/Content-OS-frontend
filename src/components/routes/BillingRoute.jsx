"use client";

import AppFrame from "../app/AppFrame";
import BillingPage from "../../BillingPage";

export default function BillingRoute() {
  return (
    <AppFrame route="billing">
      <BillingPage />
    </AppFrame>
  );
}
