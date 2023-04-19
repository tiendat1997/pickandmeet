/**
 * We can extends the env types here
 * @see https://vitejs.dev/guide/env-and-mode.html#env-files
 */

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_API_BASE_URL: string
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_POOL_ID: string
  readonly VITE_HOST: string
  readonly VITE_REGION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
