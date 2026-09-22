/// <reference path="../pb_data/types.d.ts" />

// Participación de las familias: cuentas sin contraseña (código por email),
// «A mí también» (una por cuenta y experiencia) y comentarios moderados.
//
// Las experiencias todavía son páginas estáticas, así que se identifican por
// su slug (campo `experiencia`). Cuando pasen a PocketBase será una relación.
migrate(
  (app) => {
    // ── Cuentas ─────────────────────────────────────────────────────────────
    const users = app.findCollectionByNameOrId('users');
    users.fields.add(
      new TextField({ name: 'seudonimo', max: 40, pattern: '^[^@]*$' }), // nunca un email
    );
    users.passwordAuth.enabled = false;
    users.otp.enabled = true;
    users.otp.duration = 600;
    users.otp.length = 6;
    users.otp.emailTemplate.subject = 'Tu código para {APP_NAME}';
    users.otp.emailTemplate.body = `
<p>Hola:</p>
<p>Tu código de acceso es:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{OTP}</p>
<p>Caduca en 10 minutos. Si no lo has pedido tú, ignora este mensaje.</p>
<p>{APP_NAME}</p>`;
    // Cualquiera puede crear su cuenta; solo el dueño la ve y la cambia.
    users.createRule = '';
    users.listRule = 'id = @request.auth.id';
    users.viewRule = 'id = @request.auth.id';
    users.updateRule = 'id = @request.auth.id';
    users.deleteRule = 'id = @request.auth.id';
    app.save(users);

    // ── «A mí también» ──────────────────────────────────────────────────────
    const aMiTambien = new Collection({
      type: 'base',
      name: 'a_mi_tambien',
      // Cada cuenta solo ve y borra lo suyo: nadie puede saber quién ha pulsado.
      listRule: 'usuario = @request.auth.id',
      viewRule: 'usuario = @request.auth.id',
      createRule: '@request.auth.verified = true && @request.body.usuario = @request.auth.id',
      updateRule: null,
      deleteRule: 'usuario = @request.auth.id',
      fields: [
        { name: 'experiencia', type: 'text', required: true, max: 120, pattern: '^[a-z0-9-]+$' },
        { name: 'usuario', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_a_mi_tambien_unico ON a_mi_tambien (experiencia, usuario)'],
    });
    app.save(aMiTambien);

    // Recuento público, sin datos de quién.
    app.save(
      new Collection({
        type: 'view',
        name: 'a_mi_tambien_conteo',
        listRule: '',
        viewRule: '',
        viewQuery: 'SELECT experiencia AS id, COUNT(*) AS total FROM a_mi_tambien GROUP BY experiencia',
      }),
    );

    // ── Comentarios ─────────────────────────────────────────────────────────
    // Entran siempre como «pendiente» (lo fuerza pb_hooks/comentarios.pb.js) y
    // solo el moderador, desde el panel, los pasa a «publicado» o «rechazado».
    const comentarios = new Collection({
      type: 'base',
      name: 'comentarios',
      // El autor ve los suyos (también pendientes); el público usa la vista.
      listRule: 'autor = @request.auth.id',
      viewRule: 'autor = @request.auth.id',
      createRule:
        '@request.auth.verified = true && @request.auth.seudonimo != "" && @request.body.autor = @request.auth.id',
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'experiencia', type: 'text', required: true, max: 120, pattern: '^[a-z0-9-]+$' },
        { name: 'autor', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
        { name: 'texto', type: 'text', required: true, min: 3, max: 2000 },
        { name: 'estado', type: 'select', required: true, maxSelect: 1, values: ['pendiente', 'publicado', 'rechazado'] },
        { name: 'motivo_rechazo', type: 'text', max: 500 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_comentarios_experiencia ON comentarios (experiencia, estado)'],
    });
    app.save(comentarios);

    // Solo lo publicado, con el seudónimo y sin el email ni el id del autor.
    app.save(
      new Collection({
        type: 'view',
        name: 'comentarios_publicos',
        listRule: '',
        viewRule: '',
        viewQuery: `
          SELECT c.id, c.experiencia, c.texto, c.created, u.seudonimo
          FROM comentarios c JOIN users u ON u.id = c.autor
          WHERE c.estado = 'publicado'`,
      }),
    );

    app.save(
      new Collection({
        type: 'view',
        name: 'comentarios_conteo',
        listRule: '',
        viewRule: '',
        viewQuery: `
          SELECT experiencia AS id, COUNT(*) AS total
          FROM comentarios WHERE estado = 'publicado' GROUP BY experiencia`,
      }),
    );
  },
  (app) => {
    for (const nombre of ['comentarios_conteo', 'comentarios_publicos', 'comentarios', 'a_mi_tambien_conteo', 'a_mi_tambien']) {
      app.delete(app.findCollectionByNameOrId(nombre));
    }
    const users = app.findCollectionByNameOrId('users');
    users.fields.removeByName('seudonimo');
    users.passwordAuth.enabled = true;
    users.otp.enabled = false;
    app.save(users);
  },
);
