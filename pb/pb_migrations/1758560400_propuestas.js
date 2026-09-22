/// <reference path="../pb_data/types.d.ts" />

// Propuestas de las familias para la sección de datos: vías de investigación,
// datos que analizar o errores detectados. Entran como «pendiente» (lo fuerza
// pb_hooks/propuestas.pb.js). El moderador las pasa a:
//   en_estudio · incorporada · descartada  → públicas, con su respuesta
//   rechazada                               → no se publican (spam, datos personales…)
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users');

    app.save(
      new Collection({
        type: 'base',
        name: 'propuestas',
        listRule: 'autor = @request.auth.id',
        viewRule: 'autor = @request.auth.id',
        createRule:
          '@request.auth.verified = true && @request.auth.seudonimo != "" && @request.body.autor = @request.auth.id',
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'autor', type: 'relation', required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
          { name: 'tipo', type: 'select', required: true, maxSelect: 1, values: ['investigar', 'dato', 'error'] },
          // Bloque de /datos al que se refiere (id del bloque), si viene de uno.
          { name: 'bloque', type: 'text', max: 60, pattern: '^[a-z0-9-]*$' },
          { name: 'texto', type: 'text', required: true, min: 10, max: 2000 },
          { name: 'enlace', type: 'url' },
          {
            name: 'estado',
            type: 'select',
            required: true,
            maxSelect: 1,
            values: ['pendiente', 'en_estudio', 'incorporada', 'descartada', 'rechazada'],
          },
          // Respuesta pública del moderador (por qué se descarta, dónde se ha incorporado…).
          { name: 'respuesta', type: 'text', max: 1000 },
          { name: 'created', type: 'autodate', onCreate: true },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      }),
    );

    app.save(
      new Collection({
        type: 'view',
        name: 'propuestas_publicas',
        listRule: '',
        viewRule: '',
        viewQuery: `
          SELECT p.id, p.tipo, p.bloque, p.texto, p.enlace, p.estado, p.respuesta, p.created, p.updated, u.seudonimo
          FROM propuestas p JOIN users u ON u.id = p.autor
          WHERE p.estado IN ('en_estudio', 'incorporada', 'descartada')`,
      }),
    );
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('propuestas_publicas'));
    app.delete(app.findCollectionByNameOrId('propuestas'));
  },
);
