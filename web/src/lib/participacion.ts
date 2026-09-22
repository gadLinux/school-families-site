import PocketBase, { ClientResponseError } from 'pocketbase';

/**
 * Cliente del navegador para la participación (PocketBase en /api, mismo
 * origen). La sesión se guarda en localStorage (lo hace el SDK).
 */
export const pb = new PocketBase('/');

export interface Usuario {
  id: string;
  email: string;
  seudonimo: string;
}

export function usuario(): Usuario | null {
  return pb.authStore.isValid ? (pb.authStore.record as unknown as Usuario) : null;
}

export function salir(): void {
  pb.authStore.clear();
}

/** Mensaje legible de un error de la API. */
export function mensajeError(err: unknown): string {
  if (err instanceof ClientResponseError) {
    if (err.status === 0) return 'No hay conexión con el servidor. Inténtalo en un momento.';
    if (err.status === 429) return 'Demasiados intentos. Espera un minuto.';
    const campo = Object.values(err.response?.data ?? {})[0] as { message?: string } | undefined;
    return err.response?.message && !campo ? err.response.message : 'No se ha podido completar. Revisa los datos.';
  }
  return 'Ha ocurrido un error inesperado.';
}

// ── Acceso con código por email ──────────────────────────────────────────────

/**
 * Pide un código. Si la cuenta no existe, la crea antes (sin contraseña real:
 * se genera una aleatoria que nadie conoce, porque el acceso es solo por código).
 */
export async function pedirCodigo(email: string): Promise<string> {
  // 36 caracteres: PocketBase admite hasta 71 (límite de bcrypt).
  const aleatoria = crypto.randomUUID();
  try {
    await pb.collection('users').create({ email, password: aleatoria, passwordConfirm: aleatoria });
  } catch (err) {
    // La cuenta ya existe: seguimos y pedimos el código igualmente.
    const yaExiste = err instanceof ClientResponseError && err.response?.data?.email?.code === 'validation_not_unique';
    if (!yaExiste) throw err;
  }
  const { otpId } = await pb.collection('users').requestOTP(email);
  return otpId;
}

export async function entrarConCodigo(otpId: string, codigo: string): Promise<Usuario> {
  await pb.collection('users').authWithOTP(otpId, codigo.trim());
  return usuario()!;
}

export async function guardarSeudonimo(seudonimo: string): Promise<void> {
  const u = usuario();
  if (!u) throw new Error('Sin sesión');
  await pb.collection('users').update(u.id, { seudonimo: seudonimo.trim() });
  await pb.collection('users').authRefresh();
}

/**
 * Garantiza una sesión con seudónimo. Si falta, abre el diálogo de acceso
 * (componente Acceso.astro) y espera a que termine. true = listo.
 */
export function asegurarSesion(): Promise<boolean> {
  const u = usuario();
  if (u?.seudonimo) return Promise.resolve(true);
  return new Promise((resolve) => {
    document.addEventListener('acceso:fin', (e) => resolve((e as CustomEvent<boolean>).detail), { once: true });
    document.dispatchEvent(new CustomEvent('acceso:abrir'));
  });
}

// ── «A mí también» ───────────────────────────────────────────────────────────

/** Recuento público por experiencia (slug → total). */
export async function conteosAMiTambien(): Promise<Map<string, number>> {
  const filas = await pb.collection('a_mi_tambien_conteo').getFullList<{ id: string; total: number }>();
  return new Map(filas.map((f) => [f.id, f.total]));
}

/** Experiencias en las que la cuenta actual ha pulsado (slug → id del registro). */
export async function misAMiTambien(): Promise<Map<string, string>> {
  const u = usuario();
  if (!u) return new Map();
  const filas = await pb.collection('a_mi_tambien').getFullList<{ id: string; experiencia: string }>({
    filter: pb.filter('usuario = {:u}', { u: u.id }),
  });
  return new Map(filas.map((f) => [f.experiencia, f.id]));
}

/** Pulsa o despulsa. Devuelve el nuevo estado (true = pulsado). */
export async function alternarAMiTambien(slug: string, registroId?: string): Promise<{ pulsado: boolean; id?: string }> {
  if (registroId) {
    await pb.collection('a_mi_tambien').delete(registroId);
    return { pulsado: false };
  }
  const r = await pb.collection('a_mi_tambien').create({ experiencia: slug, usuario: usuario()!.id });
  return { pulsado: true, id: r.id };
}

// ── Comentarios ──────────────────────────────────────────────────────────────

export interface Comentario {
  id: string;
  texto: string;
  created: string;
  seudonimo: string;
  pendiente?: boolean;
}

/** Publicados + los pendientes propios (solo los ve su autor). */
export async function comentarios(slug: string): Promise<Comentario[]> {
  const publicados = await pb.collection('comentarios_publicos').getFullList<Comentario>({
    filter: pb.filter('experiencia = {:s}', { s: slug }),
    sort: 'created',
  });
  const u = usuario();
  if (!u) return publicados;
  const propios = await pb.collection('comentarios').getFullList<Comentario & { estado: string }>({
    filter: pb.filter('experiencia = {:s} && estado = "pendiente"', { s: slug }),
    sort: 'created',
  });
  return [...publicados, ...propios.map((c) => ({ ...c, seudonimo: u.seudonimo, pendiente: true }))];
}

export async function comentar(slug: string, texto: string): Promise<void> {
  await pb.collection('comentarios').create({ experiencia: slug, autor: usuario()!.id, texto });
}

// ── Propuestas para la sección de datos ──────────────────────────────────────

export type TipoPropuesta = 'investigar' | 'dato' | 'error';
export type EstadoPropuesta = 'pendiente' | 'en_estudio' | 'incorporada' | 'descartada';

export interface Propuesta {
  id: string;
  tipo: TipoPropuesta;
  bloque: string;
  texto: string;
  enlace: string;
  estado: EstadoPropuesta;
  respuesta: string;
  created: string;
  seudonimo: string;
}

/** Públicas (en estudio, incorporadas, descartadas) + las pendientes propias. */
export async function propuestas(): Promise<Propuesta[]> {
  const publicas = await pb.collection('propuestas_publicas').getFullList<Propuesta>({ sort: '-created' });
  const u = usuario();
  if (!u) return publicas;
  const propias = await pb.collection('propuestas').getFullList<Propuesta>({
    filter: 'estado = "pendiente"',
    sort: '-created',
  });
  return [...propias.map((p) => ({ ...p, seudonimo: u.seudonimo })), ...publicas];
}

export async function proponer(datos: { tipo: TipoPropuesta; bloque: string; texto: string; enlace: string }): Promise<void> {
  await pb.collection('propuestas').create({ ...datos, autor: usuario()!.id });
}

// ── Experiencias escritas desde la web ───────────────────────────────────────

// El SDK cancela una petición si sale otra igual a la misma colección. Las
// consultas de experiencias se lanzan a la vez (pendientes + publicadas), así
// que van sin clave de cancelación.
const SIN_CANCELAR = { requestKey: null };

export type EstadoExperiencia = 'pendiente' | 'publicada' | 'rechazada';

export interface ExperienciaPB {
  id: string;
  collectionId: string;
  collectionName: string;
  slug: string;
  titulo: string;
  extracto: string;
  cuerpo: string; // Markdown
  seudonimo: string;
  categoria: string;
  etapa: string;
  curso: string;
  adjuntos: string[];
  adjuntos_citas: string[] | null; // cómo se cita cada adjunto en el texto, en el mismo orden
  estado: EstadoExperiencia;
  motivo_rechazo: string;
  publicada: string;
  created: string;
}

export interface NuevaExperiencia {
  titulo: string;
  extracto: string;
  cuerpo: string;
  categoria: string;
  etapa: string;
  curso: string;
}

/** Las publicadas, de la más reciente a la más antigua. */
export async function experienciasPublicadas(): Promise<ExperienciaPB[]> {
  return pb.collection('experiencias').getFullList<ExperienciaPB>({ ...SIN_CANCELAR, filter: 'estado = "publicada"', sort: '-publicada' });
}

/** Las propias que aún esperan moderación (solo las ve su autor). */
export async function misExperienciasPendientes(): Promise<ExperienciaPB[]> {
  const u = usuario();
  if (!u) return [];
  return pb.collection('experiencias').getFullList<ExperienciaPB>({
    ...SIN_CANCELAR,
    filter: pb.filter('autor = {:u} && estado = "pendiente"', { u: u.id }),
    sort: '-created',
  });
}

/** Una experiencia por su slug (publicada, o propia/moderador si no lo está). */
export async function experienciaPorSlug(slug: string): Promise<ExperienciaPB | null> {
  try {
    return await pb.collection('experiencias').getFirstListItem<ExperienciaPB>(pb.filter('slug = {:s}', { s: slug }), SIN_CANCELAR);
  } catch (err) {
    if (err instanceof ClientResponseError && err.status === 404) return null;
    throw err;
  }
}

/** Envía una experiencia con sus adjuntos. Entra como pendiente de moderación. */
export async function enviarExperiencia(datos: NuevaExperiencia, archivos: File[]): Promise<ExperienciaPB> {
  const form = new FormData();
  for (const [clave, valor] of Object.entries(datos)) form.append(clave, valor);
  form.append('autor', usuario()!.id);
  // El nombre de cada fichero (a1.jpg) es como se cita en el texto.
  for (const archivo of archivos) form.append('adjuntos', archivo);
  form.append('adjuntos_citas', JSON.stringify(archivos.map((a) => a.name)));
  return pb.collection('experiencias').create<ExperienciaPB>(form);
}

/**
 * Traduce `adjunto:a1.jpg` al fichero guardado. PocketBase renombra los
 * ficheros al guardarlos, así que se usa la lista de citas, que va en el
 * mismo orden que los adjuntos.
 */
export function resolverAdjuntos(r: ExperienciaPB): (nombre: string) => string | null {
  const citas = r.adjuntos_citas ?? [];
  return (nombre) => {
    const i = citas.indexOf(nombre);
    const fichero = i >= 0 ? r.adjuntos[i] : undefined;
    return fichero ? pb.files.getURL(r, fichero) : null;
  };
}

// ── Moderación ───────────────────────────────────────────────────────────────

export async function soyModerador(): Promise<boolean> {
  const u = usuario();
  if (!u) return false;
  try {
    const r = await pb.collection('moderadores').getList(1, 1, { filter: pb.filter('usuario = {:u}', { u: u.id }) });
    return r.totalItems > 0;
  } catch {
    return false;
  }
}

export async function experienciasPendientes(): Promise<ExperienciaPB[]> {
  return pb.collection('experiencias').getFullList<ExperienciaPB>({ ...SIN_CANCELAR, filter: 'estado = "pendiente"', sort: 'created' });
}

export async function moderarExperiencia(id: string, estado: 'publicada' | 'rechazada', motivo = ''): Promise<void> {
  await pb.collection('experiencias').update(id, { estado, motivo_rechazo: motivo });
}
