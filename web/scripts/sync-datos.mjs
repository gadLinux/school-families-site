// Copies the published CSV files from the research folder into public/datos/.
// The research folder lives outside this repo, so the copies are committed and
// this script only refreshes them: `npm run sync-datos`.
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const origen = fileURLToPath(new URL('../../../data/_analisis/csv/', import.meta.url));
const destino = fileURLToPath(new URL('../public/datos/', import.meta.url));

const publicados = [
  'brecha_titulacion_pau.csv',
  'serie_historica_aptos.csv',
  'f008_promocion_2eso_serie.csv',
  'f008_evaluacion_negativa_por_grupo.csv',
  'f008_medias_por_grupo.csv',
  'f011_resultados_centro_vs_cm.csv',
];

if (!existsSync(origen)) {
  console.error(`Research folder not found: ${origen}`);
  process.exit(1);
}
for (const f of publicados) {
  copyFileSync(origen + f, destino + f);
  console.log(`✓ ${f}`);
}
