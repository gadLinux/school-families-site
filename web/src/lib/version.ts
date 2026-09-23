// Versión de la web, calculada al compilar (solo se usa en el frontmatter,
// nunca en el navegador). Se muestra en el pie para saber qué hay publicado.
import { execFileSync } from 'node:child_process';

const REPOSITORIO = 'https://github.com/gadLinux/school-families-site';

function git(...args: string[]): string {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const commit = git('rev-parse', '--short', 'HEAD');
// Cambios sin confirmar: la versión publicada no coincide exactamente con el commit.
const conCambios = commit !== '' && git('status', '--porcelain', '--', '.') !== '';

export const version = {
  commit: commit || 'desarrollo',
  conCambios,
  fecha: new Date().toISOString().slice(0, 10),
  enlace: commit ? `${REPOSITORIO}/commit/${commit}` : null,
};
