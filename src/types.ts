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
  fileType: string;
  size: string;
  date: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
