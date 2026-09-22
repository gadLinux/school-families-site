/**
 * CSV de public/datos/, incluidos en compilación. Los mismos ficheros se
 * publican para descarga, así que el gráfico y el CSV nunca pueden divergir.
 */
const archivos = import.meta.glob<string>('/public/datos/*.csv', { query: '?raw', import: 'default', eager: true });

/**
 * Lee un CSV por nombre. Formato simple: separador «,», sin comillas ni comas
 * dentro de los campos.
 */
export function leerCsv(nombre: string): Record<string, string>[] {
  const texto = archivos[`/public/datos/${nombre}`];
  if (texto === undefined) throw new Error(`No existe public/datos/${nombre}`);
  const [cabecera, ...filas] = texto.trim().split(/\r?\n/);
  const columnas = cabecera.split(',');
  return filas.map((fila) => {
    const celdas = fila.split(',');
    return Object.fromEntries(columnas.map((c, i) => [c, celdas[i] ?? '']));
  });
}

/** Número de una celda; celda vacía → null (dato no disponible). */
export function num(valor: string): number | null {
  return valor === '' ? null : Number(valor);
}

/** 64.25 → «64,25 %». */
export function pct(valor: number, decimales = 1): string {
  return `${valor.toLocaleString('es-ES', { maximumFractionDigits: decimales })} %`;
}

/** 32.85 → «32,85» (sin símbolo). */
export function dec(valor: number, decimales = 1): string {
  return valor.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}
