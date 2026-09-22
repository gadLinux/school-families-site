import type { Experiencia } from '../data/experiencias';
import { envejecimiento, esCompartida, enDiscusion, proporcionAcuerdo, totalVotos } from './reglas';

/**
 * Puntuación para el orden «Más compartidas» (por defecto). Mayor = más arriba.
 *
 *  - «A mí también» pesa el doble que un voto: indica que el problema se repite.
 *  - Los votos cuentan por su saldo neto (▲ − ▼).
 *  - +1 base para que una historia sin votos no quede a 0 y el envejecimiento la ordene.
 *  - El resultado se multiplica por el envejecimiento (nunca baja del suelo).
 */
export function relevancia(e: Experiencia, ahora: Date = new Date()): number {
  const interes = 1 + 2 * e.aMiTambien + Math.max(0, e.votosArriba - e.votosAbajo);
  return interes * envejecimiento(e, ahora);
}

export function ordenarPorRelevancia(lista: Experiencia[], ahora: Date = new Date()): Experiencia[] {
  // Sin valoraciones que las separen, las más recientes primero.
  return [...lista].sort((a, b) => relevancia(b, ahora) - relevancia(a, ahora) || masReciente(a, b));
}

/** Orden por fecha de publicación, de la más reciente a la más antigua. */
function masReciente(a: Experiencia, b: Experiencia): number {
  return new Date(b.publicada).getTime() - new Date(a.publicada).getTime();
}

/** En discusión: primero las más votadas y más igualadas. */
function intensidadDebate(e: Experiencia): number {
  const p = proporcionAcuerdo(e);
  return totalVotos(e) * Math.min(p, 1 - p);
}

export function clasificar(lista: Experiencia[], ahora: Date = new Date()) {
  const discusion = lista.filter(enDiscusion).sort((a, b) => intensidadDebate(b) - intensidadDebate(a));
  const resto = ordenarPorRelevancia(lista.filter((e) => !enDiscusion(e)), ahora);
  const compartidas = lista.filter(esCompartida).sort((a, b) => b.aMiTambien - a.aMiTambien);
  return { resto, discusion, compartidas };
}
