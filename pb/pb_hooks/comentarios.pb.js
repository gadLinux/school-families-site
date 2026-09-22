/// <reference path="../pb_data/types.d.ts" />

// Todo comentario nuevo entra como «pendiente», diga lo que diga la petición:
// la moderación previa es la principal protección legal (CONCEPTO §5).
onRecordCreateRequest((e) => {
  const { motivoParaRechazar } = require(`${__hooks}/moderacion.js`);

  const texto = String(e.record.get('texto') || '').trim();
  const motivo = motivoParaRechazar(texto);
  if (motivo) {
    throw new BadRequestError(motivo);
  }

  e.record.set('texto', texto);
  e.record.set('estado', 'pendiente');
  e.record.set('motivo_rechazo', '');
  e.next();
}, 'comentarios');

// Aviso al moderador. Sin el email del autor: solo lo necesario para revisar.
onRecordAfterCreateSuccess((e) => {
  e.next();

  const aviso = $os.getenv('PB_AVISOS') || 'familias.diego.velazquez@gmail.com';
  const panel = `${$os.getenv('PB_PUBLIC_URL') || 'http://127.0.0.1:8090'}/_/#/collections?collection=comentarios&recordId=${e.record.id}`;
  try {
    e.app.newMailClient().send(
      new MailerMessage({
        from: { address: e.app.settings().meta.senderAddress, name: e.app.settings().meta.senderName },
        to: [{ address: aviso }],
        subject: `Comentario pendiente en «${e.record.get('experiencia')}»`,
        text: `${e.record.get('texto')}\n\nRevisar: ${panel}`,
      }),
    );
  } catch (err) {
    // Que falle el aviso no debe perder el comentario: queda en el panel.
    e.app.logger().error('No se pudo enviar el aviso de moderación', 'error', String(err));
  }
}, 'comentarios');
