import { useCallback, useEffect, useState } from "react";

export interface RouterState {
  pathname: string;
  searchParams: URLSearchParams;
}

function readRouterState(): RouterState {
  return {
    pathname: window.location.pathname,
    searchParams: new URLSearchParams(window.location.search),
  };
}

export function useRouter() {
  const [router, setRouter] = useState<RouterState>(() => readRouterState());

  useEffect(() => {
    const handlePopState = () => {
      setRouter(readRouterState());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback(
    (path: string, state?: Record<string, unknown>) => {
      window.history.pushState(state || {}, "", path);
      setRouter(readRouterState());
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [],
  );

  const replaceRoute = useCallback(
    (path: string, state?: Record<string, unknown>) => {
      window.history.replaceState(state || {}, "", path);
      setRouter(readRouterState());
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    [],
  );

  return {
    pathname: router.pathname,
    searchParams: router.searchParams,
    navigate,
    replaceRoute,
  };
}
