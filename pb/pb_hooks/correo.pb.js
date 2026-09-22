/// <reference path="../pb_data/types.d.ts" />

// Nombre, remitente y SMTP salen de variables de entorno en cada arranque, así
// las credenciales no viven ni en el repositorio ni en la base de datos.
//   PB_APP_URL, PB_SENDER, PB_SMTP_HOST, PB_SMTP_PORT, PB_SMTP_USER, PB_SMTP_PASS
onBootstrap((e) => {
  e.next();

  const s = e.app.settings();
  s.meta.appName = 'Familias Diego Velázquez';
  s.meta.appURL = $os.getenv('PB_APP_URL') || 'http://127.0.0.1:4321';
  s.meta.senderName = 'Familias Diego Velázquez';
  s.meta.senderAddress = $os.getenv('PB_SENDER') || 'familias.diego.velazquez@gmail.com';

  const host = $os.getenv('PB_SMTP_HOST');
  if (host) {
    s.smtp.enabled = true;
    s.smtp.host = host;
    s.smtp.port = parseInt($os.getenv('PB_SMTP_PORT') || '587', 10);
    s.smtp.username = $os.getenv('PB_SMTP_USER');
    s.smtp.password = $os.getenv('PB_SMTP_PASS');
    s.smtp.tls = s.smtp.port === 465;
  }
});
