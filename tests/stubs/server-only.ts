// Test stub for the `server-only` marker package (Fase 3F).
//
// The real `server-only` package throws when imported outside an RSC bundle (its
// default export). Next.js resolves it to a no-op via the `react-server` export
// condition on the server and to the throwing module on the client (build-time
// guard). Vitest runs in plain node WITHOUT that condition, so importing any
// server-only-marked module would throw at import time. This empty stub is
// aliased in vitest.config so those modules import cleanly in unit tests while
// Next.js keeps the real client-import protection in the app build.
export {};
