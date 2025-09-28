import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { CheerPage } from "@/pages/CheerPage";
import { LandingPage } from "@/pages/LandingPage";

type RouteState =
  | { type: "landing" }
  | { type: "cheer"; eventId: string; searchParams: URLSearchParams };

const isBrowser = typeof window !== "undefined";

const parseRoute = (): RouteState => {
  if (!isBrowser) return { type: "landing" };
  const url = new URL(window.location.href);

  const parseSegments = (path: string) => path.split("/").filter(Boolean);

  const hash = url.hash.replace(/^#/, "");
  const hashSegments = parseSegments(hash);
  if (hashSegments[0] === "cheer" && hashSegments[1]) {
    return {
      type: "cheer",
      eventId: decodeURIComponent(hashSegments[1]),
      searchParams: url.searchParams,
    };
  }

  const pathnameSegments = parseSegments(url.pathname);
  if (pathnameSegments[0] === "cheer" && pathnameSegments[1]) {
    return {
      type: "cheer",
      eventId: decodeURIComponent(pathnameSegments[1]),
      searchParams: url.searchParams,
    };
  }

  return { type: "landing" };
};

const useRoute = () => {
  const [route, setRoute] = useState<RouteState>(() => parseRoute());

  useEffect(() => {
    if (!isBrowser) return; // サーバーサイドレンダリング対策

    const handleRouteChange = () => {
      setRoute(parseRoute());
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, []);

  return route;
};

export const AppRouter = () => {
  const route = useRoute();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-marathon-50 to-finish-50 text-gray-900">
        {route.type === "cheer" ? (
          <CheerPage eventId={route.eventId} />
        ) : (
          <LandingPage />
        )}
      </div>

      <SpeedInsights />

      <Analytics />
    </>
  );
};
