import DOMPurify from 'dompurify';
import { Marked, type Tokens } from 'marked';

/**
 * Markdown de las experiencias → HTML seguro (solo en el navegador).
 *
 * - Los adjuntos se citan como `adjunto:a1.jpg`; `resolver` los traduce a su
 *   URL real (PocketBase) o a una URL local (vista previa en el editor).
 * - Solo se muestran como imagen los adjuntos: una imagen externa se convierte
 *   en enlace (no cargamos contenido de terceros ni exponemos a los lectores).
 * - El HTML escrito a mano se muestra como texto, y todo pasa por DOMPurify.
 */
export type ResolverAdjunto = (nombre: string) => string | null;

const PREFIJO = 'adjunto:';

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Ruta de un fichero de PocketBase en este mismo sitio (relativa o absoluta). */
function esFicheroPropio(href: string): boolean {
  try {
    const url = new URL(href, location.origin);
    return url.origin === location.origin && url.pathname.startsWith('/api/files/');
  } catch {
    return false;
  }
}

/** URLs que se aceptan como imagen: ficheros propios o vista previa local. */
function esImagenPropia(href: string): boolean {
  return esFicheroPropio(href) || href.startsWith('blob:');
}

let ganchosPuestos = false;
function ponerGanchos() {
  if (ganchosPuestos) return;
  ganchosPuestos = true;
  DOMPurify.addHook('afterSanitizeAttributes', (nodo) => {
    if (nodo.tagName === 'A') {
      const href = nodo.getAttribute('href') ?? '';
      if (/^https?:\/\//.test(href) && !esFicheroPropio(href)) {
        nodo.setAttribute('rel', 'nofollow ugc noopener');
        nodo.setAttribute('target', '_blank');
      }
    }
  });
}

export function renderizar(md: string, resolver: ResolverAdjunto): string {
  ponerGanchos();
  const marked = new Marked({ gfm: true, breaks: true });
  marked.use({
    walkTokens(token) {
      if ((token.type === 'image' || token.type === 'link') && token.href.startsWith(PREFIJO)) {
        token.href = resolver(token.href.slice(PREFIJO.length)) ?? '';
      }
    },
    renderer: {
      // «# Título» se muestra como h2 (el h1 de la página es el título) y nada baja de h4.
      heading({ tokens, depth }: Tokens.Heading) {
        const nivel = Math.min(Math.max(depth, 2), 4);
        return `<h${nivel}>${this.parser.parseInline(tokens)}</h${nivel}>`;
      },
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return escapar(text);
      },
      image({ href, text }: Tokens.Image) {
        const alt = escapar(text);
        if (!href) return `<span class="prosa__falta">[${alt || 'imagen no disponible'}]</span>`;
        if (!esImagenPropia(href)) return `<a href="${escapar(href)}">${alt || escapar(href)}</a>`;
        return `<figure><img src="${escapar(href)}" alt="${alt}" loading="lazy">${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
      },
    },
  });
  const html = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'del', 'a', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'h4', 'hr',
      'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption', 'span',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'loading', 'class', 'rel', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|blob):|\/(?!\/))/i,
  });
}

/** Texto plano de un Markdown, para el resumen de la tarjeta. */
export function textoPlano(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Resumen de hasta `max` caracteres, cortado en una palabra. */
export function resumen(md: string, max = 220): string {
  const t = textoPlano(md);
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,;:.\s]+$/, '') + '…';
}
