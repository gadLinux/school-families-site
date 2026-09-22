export interface Categoria {
  etiqueta: string;
  icono: string;
  color: string; // color del círculo del icono
}

export const categorias = {
  'evaluacion-notas': { etiqueta: 'Evaluación y notas', icono: '📝', color: '#2f7d6d' },
  convivencia: { etiqueta: 'Convivencia', icono: '🤲', color: '#c27c3a' },
  comunicacion: { etiqueta: 'Comunicación con el centro', icono: '✉️', color: '#4a6fa5' },
  diversidad: { etiqueta: 'Atención a la diversidad', icono: '🧩', color: '#8a5a9e' },
  movil: { etiqueta: 'Uso del móvil', icono: '📵', color: '#7d5a3c' },
  admision: { etiqueta: 'Admisión y matrícula', icono: '🗂️', color: '#5b6168' },
  orientacion: { etiqueta: 'Orientación y PAU', icono: '🧭', color: '#3f8f5a' },
  'funciona-bien': { etiqueta: 'Cosas que funcionan bien', icono: '🌱', color: '#6a9a2f' },
  otros: { etiqueta: 'Otros', icono: '💬', color: '#7a7f86' },
} satisfies Record<string, Categoria>;

export type CategoriaId = keyof typeof categorias;

export const etapas = {
  eso: 'ESO',
  '1eso': '1º ESO',
  '2eso': '2º ESO',
  '3eso': '3º ESO',
  '4eso': '4º ESO',
  '1bach': '1º Bach.',
  '2bach': '2º Bach.',
} as const;

export type EtapaId = keyof typeof etapas;
