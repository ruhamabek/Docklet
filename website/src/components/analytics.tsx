"use client";

import React from "react";

export function Analytics() {
  try {
    // Dynamically require @vercel/analytics/react if available in production environment
    const { Analytics: VercelAnalytics } = require("@vercel/analytics/react");
    return <VercelAnalytics />;
  } catch {
    return null;
  }
}
