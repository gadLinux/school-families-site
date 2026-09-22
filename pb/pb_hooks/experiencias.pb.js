/// <reference path="../pb_data/types.d.ts" />

// Experiencias: toda experiencia nueva entra como «pendiente», con el
// seudónimo de la cuenta y un slug único. La moderación previa es la principal
// protección legal (CONCEPTO §5).
onRecordCreateRequest((e) => {
  const { motivoParaRechazar } = require(`${__hooks}/moderacion.js`);

  const titulo = String(e.record.get('titulo') || '').trim();
  const cuerpo = String(e.record.get('cuerpo') || '').trim();
  const motivo = motivoParaRechazar(`${titulo}\n\n${cuerpo}`);
  if (motivo) {
    throw new BadRequestError(motivo);
  }

  // Slug legible + sufijo aleatorio: dos títulos iguales no chocan.
  const base = titulo
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  const sufijo = $security.randomStringWithAlphabet(6, 'abcdefghijkmnpqrstuvwxyz23456789');

  e.record.set('titulo', titulo);
  e.record.set('cuerpo', cuerpo);
  e.record.set('extracto', String(e.record.get('extracto') || '').trim().slice(0, 280));
  e.record.set('slug', `${base || 'experiencia'}-${sufijo}`);

  // Citas de los adjuntos: una por fichero, con la forma a1.jpg. Si no cuadran, se descartan
  // (los adjuntos se verán solo en la lista de moderación, no dentro del texto).
  // Los campos JSON llegan como bytes: se leen como texto y se interpretan.
  let citas = [];
  try {
    citas = JSON.parse(e.record.getString('adjuntos_citas') || '[]');
  } catch {
    citas = [];
  }
  const nFicheros = (e.record.get('adjuntos') || []).length;
  const validas =
    Array.isArray(citas) && citas.length === nFicheros && citas.every((c) => /^a[0-9]{1,2}\.[a-z]{3,4}$/.test(String(c)));
  e.record.set('adjuntos_citas', validas ? citas : []);
  e.record.set('seudonimo', e.auth ? e.auth.get('seudonimo') : '');
  e.record.set('estado', 'pendiente');
  e.record.set('motivo_rechazo', '');
  e.record.set('publicada', '');
  e.next();
}, 'experiencias');

// Al publicarla se fija la fecha (solo la primera vez) y se avisa al autor.
// El estado anterior se lee antes de guardar (e.next()) y el aviso va después.
onRecordUpdateRequest((e) => {
  const antes = e.record.original().get('estado');
  const ahora = e.record.get('estado');
  if (ahora === 'publicada' && antes !== 'publicada' && !e.record.get('publicada')) {
    e.record.set('publicada', new DateTime());
  }
  e.next();

  if (antes !== 'pendiente' || ahora === antes) return;
  let autor;
  try {
    autor = e.app.findRecordById('users', e.record.get('autor'));
  } catch {
    return;
  }
  const { enviar } = require(`${__hooks}/avisos.js`);
  const web = $os.getenv('PB_WEB_URL') || 'http://127.0.0.1:4321';
  const titulo = e.record.get('titulo');
  if (ahora === 'publicada') {
    enviar(
      e.app,
      autor.email(),
      'Tu experiencia se ha publicado',
      `Hola:\n\nHemos publicado tu experiencia «${titulo}»:\n${web}/experiencias/ver?e=${e.record.get('slug')}\n\nGracias por compartirla.`,
    );
  } else if (ahora === 'rechazada') {
    const motivo = e.record.get('motivo_rechazo') || 'No cumple las normas de publicación.';
    enviar(
      e.app,
      autor.email(),
      'Tu experiencia no se ha publicado',
      `Hola:\n\nHemos revisado tu experiencia «${titulo}» y no podemos publicarla así.\n\nMotivo: ${motivo}\n\nSi quieres, puedes escribirla de nuevo teniéndolo en cuenta.`,
    );
  }
}, 'experiencias');

// Aviso al moderador. Sin el email del autor: solo lo necesario para revisar.
onRecordAfterCreateSuccess((e) => {
  e.next();
  const { enviar } = require(`${__hooks}/avisos.js`);
  const web = $os.getenv('PB_WEB_URL') || 'http://127.0.0.1:4321';
  enviar(
    e.app,
    $os.getenv('PB_AVISOS') || 'familias.diego.velazquez@gmail.com',
    `Experiencia pendiente: «${e.record.get('titulo')}»`,
    `${e.record.get('seudonimo')} ha enviado una experiencia.\n\n${e.record.get('extracto')}\n\nRevisar y aprobar: ${web}/moderacion`,
  );
}, 'experiencias');
