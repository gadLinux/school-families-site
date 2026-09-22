// Filtro previo de comentarios, antes de que lleguen al moderador.
// Devuelve un texto con el motivo (se muestra a quien comenta) o null si pasa.
//
// Las normas (CONCEPTO §5) piden que no haya datos que identifiquen a nadie:
// nombres, emails, teléfonos... El moderador revisa todo igualmente; esto solo
// evita que lleguen datos personales a la base de datos.
module.exports = {
  motivoParaRechazar(texto) {
    // TODO(familia): decidir qué se rechaza automáticamente.
    return null;
  },
};
