import { alternarAMiTambien, asegurarSesion, conteosAMiTambien, mensajeError, misAMiTambien } from './participacion';

/**
 * Conecta todos los botones `.btn-metoo[data-slug]` de la página con PocketBase.
 * Número mostrado = data-base (recuento de partida de src/data/experiencias.ts,
 * normalmente 0) + recuento real.
 */
export async function activarBotonesAMiTambien(): Promise<void> {
  const botones = [...document.querySelectorAll<HTMLButtonElement>('.btn-metoo[data-slug]')];
  if (botones.length === 0) return;

  let conteos = new Map<string, number>();
  let mios = new Map<string, string>();

  function pintar(boton: HTMLButtonElement) {
    const slug = boton.dataset.slug!;
    const n = Number(boton.dataset.base ?? 0) + (conteos.get(slug) ?? 0);
    boton.querySelector('.btn-metoo__n')!.textContent = String(n);
    boton.setAttribute('aria-pressed', String(mios.has(slug)));
    boton.title = mios.has(slug) ? 'Pulsa otra vez para quitarlo' : 'Me ha pasado algo parecido';
  }

  async function cargar() {
    try {
      [conteos, mios] = await Promise.all([conteosAMiTambien(), misAMiTambien()]);
    } catch {
      // Sin servidor (p. ej. vista previa estática): quedan los números de partida.
    }
    botones.forEach(pintar);
  }

  for (const boton of botones) {
    boton.addEventListener('click', async () => {
      if (!(await asegurarSesion())) return;
      const slug = boton.dataset.slug!;
      boton.disabled = true;
      try {
        const r = await alternarAMiTambien(slug, mios.get(slug));
        if (r.pulsado) mios.set(slug, r.id!);
        else mios.delete(slug);
        conteos.set(slug, (conteos.get(slug) ?? 0) + (r.pulsado ? 1 : -1));
        // Puede haber dos botones de la misma experiencia en la página.
        botones.filter((b) => b.dataset.slug === slug).forEach(pintar);
      } catch (err) {
        alert(mensajeError(err));
      } finally {
        boton.disabled = false;
      }
    });
  }

  document.addEventListener('sesion:cambio', cargar);
  await cargar();
}
