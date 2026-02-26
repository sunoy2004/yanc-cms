export function getApiBase(): string {
  const viteApi = (import.meta.env.VITE_API_URL as string) || '';
  const cmsApi = (import.meta.env.VITE_CMS_API_URL as string) || '';
  const cmsBase = (import.meta.env.VITE_CMS_BASE_URL as string) || '';
  if (viteApi?.trim()) return viteApi.replace(/\/+$/, '');
  if (cmsApi?.trim()) return cmsApi.replace(/\/+$/, '');
  if (cmsBase?.trim()) return cmsBase.replace(/\/+$/, '');
  return 'http://localhost:8080';
}

export function authApi(path: string): string {
  const base = getApiBase();
  return base.endsWith('/api') ? `${base}/auth${path}` : `${base}/api/auth${path}`;
}
