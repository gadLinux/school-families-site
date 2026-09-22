import type { Experiencia } from '../data/experiencias';

/**
 * Reglas de la sección Experiencias. Los umbrales están aquí juntos para
 * poder ajustarlos sin tocar la maquetación.
 */

/** «Más de 3 personas dicen "A mí también"» → problema compartido. */
export const COMPARTIDO_MIN = 4;

/** En discusión: suficientes votos y opiniones repartidas. */
export const DISCUSION_MIN_VOTOS = 10;
/** Proporción mínima del voto minoritario (▲ o ▼) para considerar el reparto «dividido». */
export const DISCUSION_MIN_MINORIA = 0.35;

/** Envejecimiento: cada VIDA_MEDIA_DIAS la relevancia se reduce a la mitad… */
export const VIDA_MEDIA_DIAS = 30;
/** …pero nunca por debajo de este suelo: las historias envejecen, no desaparecen. */
export const SUELO_ENVEJECIMIENTO = 0.25;

export function totalVotos(e: Experiencia): number {
  return e.votosArriba + e.votosAbajo;
}

/** Proporción de votos «de acuerdo» (0-1). Sin votos → 0,5. */
export function proporcionAcuerdo(e: Experiencia): number {
  const total = totalVotos(e);
  return total === 0 ? 0.5 : e.votosArriba / total;
}

export function enDiscusion(e: Experiencia): boolean {
  const minoria = Math.min(proporcionAcuerdo(e), 1 - proporcionAcuerdo(e));
  return totalVotos(e) >= DISCUSION_MIN_VOTOS && minoria >= DISCUSION_MIN_MINORIA;
}

/** Un tema disputado no se presenta como «problema compartido» hasta que se aclare. */
export function esCompartida(e: Experiencia): boolean {
  return e.aMiTambien >= COMPARTIDO_MIN && !enDiscusion(e);
}

/** Factor de envejecimiento entre SUELO_ENVEJECIMIENTO y 1. */
export function envejecimiento(e: Experiencia, ahora: Date): number {
  const dias = Math.max(0, (ahora.getTime() - new Date(e.publicada).getTime()) / 86_400_000);
  const decae = Math.pow(0.5, dias / VIDA_MEDIA_DIAS);
  return SUELO_ENVEJECIMIENTO + (1 - SUELO_ENVEJECIMIENTO) * decae;
}
