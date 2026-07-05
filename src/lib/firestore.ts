import {
  collection,
  doc,
  addDoc,
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
import {
  NewsItem,
  Proposal,
  ProposalStatus,
  ProposalResponse,
  Vote,
  VoteOption,
  AuthorizedUser,
  DocItem,
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
