import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  arrayUnion,
  serverTimestamp,
  runTransaction,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { initialBono } from '../data';
import {
  NewsItem,
  Proposal,
  ProposalStatus,
  ProposalResponse,
  Vote,
  VoteOption,
  AuthorizedUser,
  DocItem,
  BonoInfo,
  CourseSale,
  EventItem,
  TeamMember,
} from '../types';

const fechaHoy = () =>
  new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

// ---------------------------------------------------------------------------
// Noticias
// ---------------------------------------------------------------------------

const noticiasCol = collection(db, 'noticias');

export async function getNoticias(): Promise<NewsItem[]> {
  const q = query(noticiasCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsItem));
}

export function subscribeNoticias(onChange: (items: NewsItem[]) => void): Unsubscribe {
  const q = query(noticiasCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsItem)));
  });
}

export async function createNoticia(data: Omit<NewsItem, 'id' | 'date' | 'featured'>): Promise<string> {
  const ref = await addDoc(noticiasCol, {
    ...data,
    date: fechaHoy(),
    featured: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNoticia(id: string, data: Partial<NewsItem>): Promise<void> {
  await updateDoc(doc(db, 'noticias', id), data);
}

export async function deleteNoticia(id: string): Promise<void> {
  await deleteDoc(doc(db, 'noticias', id));
}

// ---------------------------------------------------------------------------
// Propuestas
// ---------------------------------------------------------------------------

const propuestasCol = collection(db, 'propuestas');

export async function getPropuestas(): Promise<Proposal[]> {
  const q = query(propuestasCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Proposal));
}

export function subscribePropuestas(onChange: (items: Proposal[]) => void): Unsubscribe {
  const q = query(propuestasCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Proposal)));
  });
}

export async function createPropuesta(
  data: Omit<Proposal, 'id' | 'date' | 'upvotes' | 'downvotes' | 'userVote' | 'responses'>
): Promise<string> {
  const ref = await addDoc(propuestasCol, {
    ...data,
    date: fechaHoy(),
    upvotes: 0,
    downvotes: 0,
    responses: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePropuestaEstado(
  id: string,
  estado: ProposalStatus,
  respuesta?: ProposalResponse
): Promise<void> {
  const ref = doc(db, 'propuestas', id);
  if (respuesta) {
    await updateDoc(ref, { status: estado, responses: arrayUnion(respuesta) });
  } else {
    await updateDoc(ref, { status: estado });
  }
}

export async function updatePropuestaVotos(id: string, upvotes: number, downvotes: number): Promise<void> {
  await updateDoc(doc(db, 'propuestas', id), { upvotes, downvotes });
}

// ---------------------------------------------------------------------------
// Votaciones
// ---------------------------------------------------------------------------

const votacionesCol = collection(db, 'votaciones');

export async function getVotaciones(): Promise<Vote[]> {
  const q = query(votacionesCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote));
}

export function subscribeVotaciones(onChange: (items: Vote[]) => void): Unsubscribe {
  const q = query(votacionesCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote)));
  });
}

export async function createVotacion(question: string, opciones: string[], expiresDays: number): Promise<string> {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + expiresDays);

  const options: VoteOption[] = opciones.map((text, idx) => ({
    id: `opt-${Date.now()}-${idx}`,
    text,
    votes: 0,
  }));

  const ref = await addDoc(votacionesCol, {
    question,
    options,
    totalVotes: 0,
    expiresAt: expiry.toISOString(),
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function yaVoto(votacionId: string, userId: string): Promise<string | null> {
  const votoRef = doc(db, 'votaciones', votacionId, 'votos', userId);
  const snap = await getDoc(votoRef);
  return snap.exists() ? (snap.data().opcionId as string) : null;
}

export async function registrarVoto(votacionId: string, userId: string, opcionId: string): Promise<void> {
  const votacionRef = doc(db, 'votaciones', votacionId);
  const votoRef = doc(db, 'votaciones', votacionId, 'votos', userId);

  await runTransaction(db, async (tx) => {
    const [votacionSnap, votoSnap] = await Promise.all([tx.get(votacionRef), tx.get(votoRef)]);

    if (!votacionSnap.exists()) throw new Error('La votación no existe');
    if (votoSnap.exists()) throw new Error('Ya votaste en esta consulta');

    const data = votacionSnap.data() as Vote;
    const updatedOptions = data.options.map((opt) =>
      opt.id === opcionId ? { ...opt, votes: opt.votes + 1 } : opt
    );

    tx.update(votacionRef, { options: updatedOptions, totalVotes: data.totalVotes + 1 });
    tx.set(votoRef, { userId, opcionId, timestamp: serverTimestamp() });
  });
}

// ---------------------------------------------------------------------------
// Usuarios autorizados
// ---------------------------------------------------------------------------

const usuariosAutorizadosCol = collection(db, 'usuarios_autorizados');

export async function getUsuariosAutorizados(): Promise<AuthorizedUser[]> {
  const snap = await getDocs(usuariosAutorizadosCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuthorizedUser));
}

export async function addUsuarioAutorizado(data: Omit<AuthorizedUser, 'id' | 'active'>): Promise<string> {
  const ref = await addDoc(usuariosAutorizadosCol, { ...data, active: true });
  return ref.id;
}

export async function updateUsuarioAutorizado(id: string, data: Partial<AuthorizedUser>): Promise<void> {
  await updateDoc(doc(db, 'usuarios_autorizados', id), data);
}

export async function deleteUsuarioAutorizado(id: string): Promise<void> {
  await deleteDoc(doc(db, 'usuarios_autorizados', id));
}

// ---------------------------------------------------------------------------
// Documentos oficiales
// ---------------------------------------------------------------------------

const documentosCol = collection(db, 'documentos');

export async function getDocumentos(soloActivos = false): Promise<DocItem[]> {
  const q = soloActivos
    ? query(documentosCol, where('active', '==', true), orderBy('createdAt', 'desc'))
    : query(documentosCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DocItem));
}

export async function addDocumento(data: Omit<DocItem, 'id' | 'date' | 'active'>): Promise<string> {
  const ref = await addDoc(documentosCol, {
    ...data,
    date: fechaHoy(),
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function toggleDocumentoActivo(id: string, activo: boolean): Promise<void> {
  await updateDoc(doc(db, 'documentos', id), { active: activo });
}

export async function deleteDocumento(id: string): Promise<void> {
  await deleteDoc(doc(db, 'documentos', id));
}

// ---------------------------------------------------------------------------
// Bono Contribución
// ---------------------------------------------------------------------------

const bonoConfigRef = doc(db, 'bono', 'config');
const bonoVentasCol = collection(db, 'bono', 'config', 'ventas');

const slugCurso = (curso: string) => curso.replace(/\s+/g, '_').replace(/[°]/g, '');

async function seedBonoIfMissing(): Promise<void> {
  const configSnap = await getDoc(bonoConfigRef);
  if (!configSnap.exists()) {
    await updateBonoConfigInternal({
      totalMeta: initialBono.goal,
      fechaSorteo: initialBono.drawDate,
      premios: initialBono.prizes,
    });
  }

  const ventasSnap = await getDocs(bonoVentasCol);
  if (ventasSnap.empty) {
    await Promise.all(
      initialBono.courseSales.map((cs) =>
        updateVentasCurso(cs.course, cs.sales)
      )
    );
  }
}

async function updateBonoConfigInternal(data: {
  totalMeta: number;
  fechaSorteo: string;
  premios: BonoInfo['prizes'];
}): Promise<void> {
  await setDoc(bonoConfigRef, data, { merge: true });
}

export async function getBono(): Promise<BonoInfo> {
  await seedBonoIfMissing();

  const [configSnap, ventasSnap] = await Promise.all([getDoc(bonoConfigRef), getDocs(bonoVentasCol)]);
  const config = configSnap.data() as { totalMeta: number; fechaSorteo: string; premios: BonoInfo['prizes'] };
  const courseSales: CourseSale[] = ventasSnap.docs.map((d) => {
    const v = d.data();
    return { course: v.curso, sales: v.cantidad };
  });

  return {
    totalRaised: courseSales.reduce((acc, c) => acc + c.sales, 0),
    goal: config.totalMeta,
    drawDate: config.fechaSorteo,
    prizes: config.premios,
    courseSales,
  };
}

export function subscribeBono(onChange: (info: BonoInfo) => void): Unsubscribe {
  let latestConfig: { totalMeta: number; fechaSorteo: string; premios: BonoInfo['prizes'] } | null = null;
  let latestVentas: CourseSale[] = [];

  const emit = () => {
    if (!latestConfig) return;
    onChange({
      totalRaised: latestVentas.reduce((acc, c) => acc + c.sales, 0),
      goal: latestConfig.totalMeta,
      drawDate: latestConfig.fechaSorteo,
      prizes: latestConfig.premios,
      courseSales: latestVentas,
    });
  };

  const unsubConfig = onSnapshot(bonoConfigRef, (snap) => {
    if (snap.exists()) {
      latestConfig = snap.data() as { totalMeta: number; fechaSorteo: string; premios: BonoInfo['prizes'] };
      emit();
    }
  });

  const unsubVentas = onSnapshot(bonoVentasCol, (snap) => {
    latestVentas = snap.docs.map((d) => {
      const v = d.data();
      return { course: v.curso, sales: v.cantidad };
    });
    emit();
  });

  return () => {
    unsubConfig();
    unsubVentas();
  };
}

export async function updateVentasCurso(curso: string, cantidad: number): Promise<void> {
  const ventaRef = doc(db, 'bono', 'config', 'ventas', slugCurso(curso));
  await setDoc(ventaRef, { curso, division: '', cantidad }, { merge: true });
}

export async function updateFechaSorteo(fechaSorteo: string): Promise<void> {
  await updateDoc(bonoConfigRef, { fechaSorteo });
}

export async function addPremio(premio: Omit<BonoInfo['prizes'][number], 'id'>): Promise<void> {
  await seedBonoIfMissing();
  const configSnap = await getDoc(bonoConfigRef);
  const config = configSnap.data() as { premios: BonoInfo['prizes'] };
  const nuevoPremio = { ...premio, id: `prize-${Date.now()}` };
  await updateDoc(bonoConfigRef, { premios: [...(config.premios || []), nuevoPremio] });
}

export async function deletePremio(id: string): Promise<void> {
  const configSnap = await getDoc(bonoConfigRef);
  const config = configSnap.data() as { premios: BonoInfo['prizes'] };
  await updateDoc(bonoConfigRef, { premios: (config.premios || []).filter((p) => p.id !== id) });
}

// ---------------------------------------------------------------------------
// Eventos / Agenda
// ---------------------------------------------------------------------------

const eventosCol = collection(db, 'eventos');

function eventoDocToItem(id: string, data: any): EventItem {
  const fechaObj = new Date(data.fecha);
  return {
    id,
    title: data.titulo,
    description: data.descripcion,
    date: fechaObj.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
    time: fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    location: data.tipo,
    fechaISO: data.fecha,
    tipo: data.tipo,
  };
}

export async function getEventos(): Promise<EventItem[]> {
  const q = query(eventosCol, orderBy('fecha', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => eventoDocToItem(d.id, d.data()));
}

export function subscribeEventos(onChange: (items: EventItem[]) => void): Unsubscribe {
  const q = query(eventosCol, orderBy('fecha', 'asc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => eventoDocToItem(d.id, d.data())));
  });
}

export async function createEvento(data: {
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
}): Promise<string> {
  const ref = await addDoc(eventosCol, data);
  return ref.id;
}

export async function updateEvento(
  id: string,
  data: Partial<{ titulo: string; descripcion: string; fecha: string; tipo: string }>
): Promise<void> {
  await updateDoc(doc(db, 'eventos', id), data);
}

export async function deleteEvento(id: string): Promise<void> {
  await deleteDoc(doc(db, 'eventos', id));
}

// ---------------------------------------------------------------------------
// Equipo / Nosotros
// ---------------------------------------------------------------------------

const equipoCol = collection(db, 'equipo');

function miembroDocToItem(id: string, data: any): TeamMember {
  return {
    id,
    name: data.nombre,
    role: data.cargo,
    photo: data.foto,
    orden: data.orden,
  };
}

export async function getEquipo(): Promise<TeamMember[]> {
  const q = query(equipoCol, orderBy('orden', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => miembroDocToItem(d.id, d.data()));
}

export function subscribeEquipo(onChange: (items: TeamMember[]) => void): Unsubscribe {
  const q = query(equipoCol, orderBy('orden', 'asc'));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => miembroDocToItem(d.id, d.data())));
  });
}

export async function createMiembro(data: {
  nombre: string;
  cargo: string;
  foto: string;
  orden: number;
}): Promise<string> {
  const ref = await addDoc(equipoCol, data);
  return ref.id;
}

export async function updateEquipo(
  id: string,
  data: Partial<{ nombre: string; cargo: string; foto: string; orden: number }>
): Promise<void> {
  await updateDoc(doc(db, 'equipo', id), data);
}

export async function deleteMiembro(id: string): Promise<void> {
  await deleteDoc(doc(db, 'equipo', id));
}

// ---------------------------------------------------------------------------
// Banner Destacado (Inicio)
// ---------------------------------------------------------------------------

export interface BannerConfig {
  bannerActivo: boolean;
  bannerTexto: string;
}

const bannerConfigRef = doc(db, 'config', 'banner');

const DEFAULT_BANNER: BannerConfig = {
  bannerActivo: true,
  bannerTexto: '¡Bono Contribución disponible! Sorteá un Smart TV 43" y más premios. Solicitá tu talonario a tu delegado de curso. Todo recaudado va para el sonido.',
};

export async function getBanner(): Promise<BannerConfig> {
  const snap = await getDoc(bannerConfigRef);
  if (!snap.exists()) {
    await setDoc(bannerConfigRef, DEFAULT_BANNER);
    return DEFAULT_BANNER;
  }
  return snap.data() as BannerConfig;
}

export function subscribeBanner(onChange: (banner: BannerConfig) => void): Unsubscribe {
  return onSnapshot(bannerConfigRef, (snap) => {
    if (snap.exists()) onChange(snap.data() as BannerConfig);
  });
}

export async function updateBanner(data: BannerConfig): Promise<void> {
  await setDoc(bannerConfigRef, data, { merge: true });
}
