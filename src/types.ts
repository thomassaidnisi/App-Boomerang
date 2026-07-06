export interface NewsItem {
  id: string;
  date: string;
  title: string;
  description: string;
  content: string;
  image: string;
  featured: boolean;
}

export type ProposalStatus = 'Recibida' | 'En análisis' | 'En el CEC' | 'Resuelta' | 'Archivada';

export interface ProposalResponse {
  date: string;
  responder: string;
  text: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  course: string;
  status: ProposalStatus;
  date: string;
  author: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  responses: ProposalResponse[];
}

export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface Vote {
  id: string;
  question: string;
  options: VoteOption[];
  totalVotes: number;
  expiresAt: string;
  userVotedOptionId: string | null;
  active: boolean;
}

export interface Prize {
  id: string;
  title: string;
  image: string;
  description: string;
}

export interface CourseSale {
  course: string;
  sales: number;
}

export interface BonoInfo {
  totalRaised: number;
  goal: number;
  drawDate: string;
  prizes: Prize[];
  courseSales: CourseSale[];
}

export interface DocItem {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  size: string;
  date: string;
  content: string;
  active: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  /** Raw ISO datetime + category, kept for admin editing (not shown in the public UI) */
  fechaISO?: string;
  tipo?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  /** Sort order, kept for admin editing (not shown in the public UI) */
  orden?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export type UserRole = 'Estudiante' | 'Docente' | 'Admin';

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  course?: string;
  active: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface BannerConfig {
  bannerActivo: boolean;
  bannerTexto: string;
}
