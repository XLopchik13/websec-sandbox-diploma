export interface RouteParams {
  [key: string]: string;
}

export interface Route {
  path: string;
  pattern: RegExp;
  paramKeys: string[];
}
