// pdf-parse's index.js contains bundler-hostile debug code that reads a test
// file at import time. We import the library entrypoint directly to avoid it;
// this re-exports the types for that subpath.
declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdf from 'pdf-parse';
  export default pdf;
}
