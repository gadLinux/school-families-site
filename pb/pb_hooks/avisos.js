// Envío de avisos por email desde los hooks. Módulo aparte porque los
// callbacks de PocketBase se ejecutan aislados y no ven funciones de fuera.
module.exports = {
  enviar(app, para, asunto, texto) {
    try {
      app.newMailClient().send(
        new MailerMessage({
          from: { address: app.settings().meta.senderAddress, name: app.settings().meta.senderName },
          to: [{ address: para }],
          subject: asunto,
          text: texto,
        }),
      );
    } catch (err) {
      // Que falle un aviso no debe perder el registro: queda en moderación.
      app.logger().error('No se pudo enviar un aviso', 'para', para, 'error', String(err));
    }
  },
};
