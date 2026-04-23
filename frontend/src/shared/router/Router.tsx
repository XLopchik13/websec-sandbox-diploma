import type { ReactNode } from "react";
import { useRouter } from "./useRouter";
import { parseRoute, matchRoute } from "./parseRoute";
import type { RouteParams } from "./types";

export interface RouteConfig {
  path: string;
  component: (params: RouteParams) => ReactNode;
}

interface RouterProps {
  routes: RouteConfig[];
  fallback: ReactNode;
}

export function Router({ routes, fallback }: RouterProps) {
  const { pathname } = useRouter();

  for (const route of routes) {
    const parsed = parseRoute(route.path);
    const params = matchRoute(pathname, parsed);
    if (params !== null) {
      return <>{route.component(params)}</>;
    }
  }

  return <>{fallback}</>;
}
