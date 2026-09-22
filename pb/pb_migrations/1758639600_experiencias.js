/// <reference path="../pb_data/types.d.ts" />

// Experiencias escritas por las familias desde la web (Markdown + adjuntos).
// Entran como «pendiente» (lo fuerza pb_hooks/experiencias.pb.js). Solo los
// moderadores las ven antes de publicarse y las pasan a:
//   publicada  → visible para todos
//   rechazada  → no se publica; el autor recibe el motivo por email
//
// Moderadores: colección aparte que solo gestiona un superusuario desde el
// panel. Así nadie puede nombrarse moderador editando su propia cuenta.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');

    const moderadores = new Collection({
      type: 'base',
      name: 'moderadores',
      // Cada moderador puede comprobar que lo es (la web lo usa); nada más.
      listRule: 'usuario = @request.auth.id',
      viewRule: 'usuario = @request.auth.id',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'usuario', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
        { name: 'created', type: 'autodate', onCreate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_moderadores_usuario ON moderadores (usuario)'],
    });
    app.save(moderadores);

    const esModerador = '@collection.moderadores.usuario ?= @request.auth.id';

    app.save(
      new Collection({
        type: 'base',
        name: 'experiencias',
        listRule: `estado = "publicada" || autor = @request.auth.id || ${esModerador}`,
        viewRule: `estado = "publicada" || autor = @request.auth.id || ${esModerador}`,
        createRule:
          '@request.auth.verified = true && @request.auth.seudonimo != "" && @request.body.autor = @request.auth.id',
        // Solo moderación: publicar, rechazar o corregir (p. ej. anonimizar).
        updateRule: esModerador,
        deleteRule: esModerador,
        fields: [
          { name: 'autor', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
          // Copia del seudónimo al crearla: la experiencia se lee sin exponer la cuenta.
          { name: 'seudonimo', type: 'text', max: 40 },
          // Lo genera el hook a partir del título. Enlaza con «A mí también» y comentarios.
          { name: 'slug', type: 'text', max: 120, pattern: '^[a-z0-9-]*$' },
          { name: 'titulo', type: 'text', required: true, min: 8, max: 120 },
          { name: 'extracto', type: 'text', required: true, min: 20, max: 280 },
          // Markdown. Los adjuntos se citan como adjunto:a1.jpg (ver web/src/lib/markdown.ts).
          { name: 'cuerpo', type: 'text', required: true, min: 50, max: 20000 },
          {
            name: 'categoria',
            type: 'select',
            required: true,
            maxSelect: 1,
            // Igual que web/src/data/categorias.ts
            values: ['evaluacion-notas', 'convivencia', 'comunicacion', 'diversidad', 'movil', 'admision', 'orientacion', 'funciona-bien', 'otros'],
          },
          {
            name: 'etapa',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['eso', '1eso', '2eso', '3eso', '4eso', '1bach', '2bach'],
          },
          { name: 'curso', type: 'text', required: true, pattern: '^[0-9]{4}-[0-9]{4}$' },
          {
            name: 'adjuntos',
            type: 'file',
            maxSelect: 10,
            maxSize: 5 * 1024 * 1024,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
          },
          // Nombre con el que se cita cada adjunto, en el mismo orden que `adjuntos`
          // (PocketBase renombra los ficheros al guardarlos).
          { name: 'adjuntos_citas', type: 'json', maxSize: 2000 },
          { name: 'estado', type: 'select', required: true, maxSelect: 1, values: ['pendiente', 'publicada', 'rechazada'] },
          { name: 'motivo_rechazo', type: 'text', max: 1000 },
          { name: 'publicada', type: 'date' },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_experiencias_slug ON experiencias (slug) WHERE slug != ""',
          'CREATE INDEX idx_experiencias_estado ON experiencias (estado, publicada)',
        ],
      }),
    );
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('experiencias'));
    app.delete(app.findCollectionByNameOrId('moderadores'));
  },
);
