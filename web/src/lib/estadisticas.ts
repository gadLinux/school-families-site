// Estadísticas de visitas con Matomo, sin cookies.
// Solo se activa si la compilación recibe PUBLIC_MATOMO_URL y
// PUBLIC_MATOMO_SITE_ID (Ansible los pasa desde un fichero privado); en
// desarrollo no se mide nada.

const url = import.meta.env.PUBLIC_MATOMO_URL;
const sitio = import.meta.env.PUBLIC_MATOMO_SITE_ID;
const activo = Boolean(url && sitio);

function cola(): unknown[][] {
  const w = window as unknown as { _paq?: unknown[][] };
  return (w._paq ??= []);
}

/** Carga Matomo. Las páginas con título dinámico registran su visita después. */
export function iniciarEstadisticas(visitaAutomatica: boolean) {
  if (!activo) return;
  const base = url.endsWith('/') ? url : `${url}/`;
  const _paq = cola();
  // Sin cookies: no hace falta pedir consentimiento (LSSI art. 22.2).
  _paq.push(['disableCookies']);
  _paq.push(['enableLinkTracking']);
  _paq.push(['setTrackerUrl', `${base}matomo.php`]);
  _paq.push(['setSiteId', sitio]);
  if (visitaAutomatica) _paq.push(['trackPageView']);
  const g = document.createElement('script');
  g.async = true;
  g.src = `${base}matomo.js`;
  document.head.append(g);
}

/** Registra la visita con un título y, si hace falta, una URL distintos de los de la página. */
export function registrarVisita(titulo: string, urlPropia?: string) {
  if (!activo) return;
  const _paq = cola();
  if (urlPropia) _paq.push(['setCustomUrl', new URL(urlPropia, location.origin).href]);
  _paq.push(['setDocumentTitle', titulo]);
  _paq.push(['trackPageView']);
}
