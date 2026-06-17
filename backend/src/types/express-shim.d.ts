declare module 'express' {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;

  export function Router(): any;
  export function json(options?: any): any;
  export function urlencoded(options?: any): any;

  const express: {
    Router: typeof Router;
    json: typeof json;
    urlencoded: typeof urlencoded;
  };

  export default express;
}
