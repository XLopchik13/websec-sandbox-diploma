import type { Route, RouteParams } from "./types";

export function parseRoute(path: string): Route {
  const paramKeys: string[] = [];
  const patternStr = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramKeys.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment;
    })
    .join("/");

  return {
    path,
    pattern: new RegExp(`^${patternStr}/?$`),
    paramKeys,
  };
}

export function matchRoute(pathname: string, route: Route): RouteParams | null {
  const match = pathname.match(route.pattern);
  if (!match) return null;

  const params: RouteParams = {};
  route.paramKeys.forEach((key, index) => {
    params[key] = match[index + 1];
  });

  return params;
}
