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
  'f011_matricula_por_etapa.csv',
  'f012_pau_centro_oficial_vs_publicado.csv',
  'f012_titulacion_bachillerato.csv',
  'f012_admision_solicitudes.csv',
  'f002_notas_expediente_pau.csv',
  'f008_no_promocion_agregado_2025-26.csv',
  'f008_final_materias_y_composicion_2eso.csv',
  'f013_idoneidad_eso_cm_oeste_torrelodones.csv',
];

if (!existsSync(origen)) {
  console.error(`Research folder not found: ${origen}`);
  process.exit(1);
}
// Every CSV travels with its provenance: <name>.meta.json (sources, method,
// validation counter). No metadata, no publication.
const sinMeta = publicados.filter((f) => !existsSync(origen + f.replace(/\.csv$/, '.meta.json')));
if (sinMeta.length) {
  console.error(`Missing .meta.json for: ${sinMeta.join(', ')}`);
  process.exit(1);
}
for (const f of publicados) {
  const meta = f.replace(/\.csv$/, '.meta.json');
  copyFileSync(origen + f, destino + f);
  copyFileSync(origen + meta, destino + meta);
  console.log(`✓ ${f} + ${meta}`);
}
