// Images stored on questions/options are paths on radiance-backend (e.g.
// /uploads/<uuid>.png). The browser can't always reach BACKEND_URL directly,
// so admin pages load them through this app's proxy (app/backend-files).
export function backendFileUrl(path: string): string {
  return `/backend-files${path}`
}
