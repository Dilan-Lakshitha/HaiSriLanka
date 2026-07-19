declare module '../dist/haisrilanka/server/server.mjs' {
  export const reqHandler: (request: Request) => Promise<Response>;
}
