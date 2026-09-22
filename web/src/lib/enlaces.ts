export type Trozo = { texto: string; href?: string };

/**
 * Un párrafo que es solo una imagen, `![descripción](/documentos/…)`, se
 * muestra como figura. Solo imágenes propias (ruta /…): nada de terceros.
 */
export function imagen(parrafo: string): { alt: string; src: string } | null {
  const m = parrafo.trim().match(/^!\[([^\]]*)\]\((\/[^)\s]+)\)$/);
  return m ? { alt: m[1], src: m[2] } : null;
}

/**
 * Parte un párrafo con enlaces al estilo Markdown, `[texto](/datos#bloque)`, en
 * trozos de texto y enlaces. Solo acepta rutas internas (/…) y https://; lo
 * demás se deja como texto, para que un error de escritura no cree enlaces raros.
 */
export function trozos(parrafo: string): Trozo[] {
  const salida: Trozo[] = [];
  const patron = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let desde = 0;
  for (const m of parrafo.matchAll(patron)) {
    const [entero, texto, href] = m;
    const valido = href.startsWith('/') || href.startsWith('https://');
    if (m.index > desde) salida.push({ texto: parrafo.slice(desde, m.index) });
    salida.push(valido ? { texto, href } : { texto: entero });
    desde = m.index + entero.length;
  }
  if (desde < parrafo.length) salida.push({ texto: parrafo.slice(desde) });
  return salida;
}

