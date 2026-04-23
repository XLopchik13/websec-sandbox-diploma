import type { ReactNode } from "react";
import type { RouteConfig } from "@/shared/router/Router";
import type { SandboxView } from "@/pages/SandboxPage/SandboxPage";
import { NotFoundPage } from "@/pages/NotFoundPage/NotFoundPage";

interface CreateAppRoutesArgs {
  renderAuthPage: () => ReactNode;
  renderDashboardPage: (view: SandboxView) => ReactNode;
  homePath: string;
}

export function createAppRoutes({
  renderAuthPage,
  renderDashboardPage,
  homePath,
}: CreateAppRoutesArgs): RouteConfig[] {
  return [
    { path: "/", component: () => renderAuthPage() },
    {
      path: "/dashboard",
      component: () => renderDashboardPage({ kind: "welcome" }),
    },
    {
      path: "/dashboard/level/:levelId",
      component: ({ levelId }) =>
        renderDashboardPage({ kind: "practice", levelId }),
    },
    {
      path: "/dashboard/theory/:category",
      component: ({ category }) =>
        renderDashboardPage({
          kind: "theory",
          category: decodeURIComponent(category),
        }),
    },
    {
      path: "/404",
      component: () => <NotFoundPage homePath={homePath} />,
    },
  ];
}
