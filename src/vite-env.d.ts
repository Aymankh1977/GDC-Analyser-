/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  // add other env variables you use
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
