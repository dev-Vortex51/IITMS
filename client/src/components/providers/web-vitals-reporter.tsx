"use client";

import { useReportWebVitals } from "next/web-vitals";

type WindowWithVitals = Window & {
  __IITMS_WEB_VITALS__?: Array<Record<string, unknown>>;
};

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined") return;

    const payload = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    };

    const w = window as WindowWithVitals;
    w.__IITMS_WEB_VITALS__ = w.__IITMS_WEB_VITALS__ || [];
    w.__IITMS_WEB_VITALS__.push(payload);

    if (process.env.NODE_ENV !== "production") {
      // Keep this in development for easy profiling without spamming prod logs.
      console.info("[web-vitals]", payload);
    }
  });

  return null;
}
