/**
 * Prefetch common route chunks when the browser is idle.
 * Call once after the app mounts.
 */
export function prefetchCommonRoutes(): void {
  if (typeof window === 'undefined') return;

  const routes = [
    () => import('../pages/data-marts/list/DataMartsPage'),
    () => import('../pages/data-marts/create/CreateDataMartPage'),
    () => import('../pages/search/SearchPage'),
    () => import('../pages/project-settings/ProjectSettingsPage'),
  ];

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      routes.forEach(load => load());
    });
  }
}
