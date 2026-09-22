/// <reference path="../pb_data/types.d.ts" />

// Igual que los comentarios: toda propuesta entra como «pendiente» y se avisa
// al moderador. Pasa por el mismo filtro previo (moderacion.js).
onRecordCreateRequest((e) => {
  const { motivoParaRechazar } = require(`${__hooks}/moderacion.js`);

  const texto = String(e.record.get('texto') || '').trim();
  const motivo = motivoParaRechazar(texto);
  if (motivo) {
    throw new BadRequestError(motivo);
  }

  e.record.set('texto', texto);
  e.record.set('estado', 'pendiente');
  e.record.set('respuesta', '');
  e.next();
}, 'propuestas');

onRecordAfterCreateSuccess((e) => {
  e.next();

  const aviso = $os.getenv('PB_AVISOS') || 'familias.diego.velazquez@gmail.com';
  const panel = `${$os.getenv('PB_PUBLIC_URL') || 'http://127.0.0.1:8090'}/_/#/collections?collection=propuestas&recordId=${e.record.id}`;
  const bloque = e.record.get('bloque') ? ` (bloque «${e.record.get('bloque')}»)` : '';
  try {
    e.app.newMailClient().send(
      new MailerMessage({
        from: { address: e.app.settings().meta.senderAddress, name: e.app.settings().meta.senderName },
        to: [{ address: aviso }],
        subject: `Nueva propuesta de datos: ${e.record.get('tipo')}${bloque}`,
        text: `${e.record.get('texto')}\n\nEnlace: ${e.record.get('enlace') || '—'}\n\nRevisar: ${panel}`,
      }),
    );
  } catch (err) {
    e.app.logger().error('No se pudo enviar el aviso de propuesta', 'error', String(err));
  }
}, 'propuestas');
