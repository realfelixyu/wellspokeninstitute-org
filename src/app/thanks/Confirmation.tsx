"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { consumeSignupReceipt } from "../../../lib/signup-receipt.mjs";

export function Confirmation({ pending, gaId }: { pending: boolean; gaId: string }) {
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    if (consumeSignupReceipt(window, pending, gaId)) setRequested(true);
  }, [pending, gaId]);
  return <PageHeader eyebrow="Newsletter"
    title={requested ? "Check your inbox" : "Research newsletter"}
    lede={requested ? "Open the link in the confirmation email to subscribe."
      : "The Institute sends research and teaching resources by email. Visit the newsletter page to subscribe."} />;
}
