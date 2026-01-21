
export enum MemberLevel {
  MAGANG = 'Magang',
  BASIC = 'Basic',
  ADVANCE = 'Advance',
  PROFESIONAL = 'Profesional',
  MASTER = 'Master',
  INSTRUKTUR = 'Instruktur'
}

export interface Styling {
  bold: boolean;
  italic: boolean;
  justify: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Training {
  id: string;
  title: string;
  date: string;
  jam: string;
  tempat: string;
  whatsapp: string;
  imageUrl: string;
  instructorId: string;
  instructorName: string;
}

export interface ClinicPost {
  id: string;
  namaKlinik: string;
  whatsapp: string;
  alamat: string;
  mapsUrl?: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
}

export interface Announcement {
  id: string;
  message: string;
  targetMemberId?: string; // Jika ada, hanya untuk member tertentu
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  ktaNumber: string;
  city: string;
  level: MemberLevel;
  whatsapp: string;
  address: string;
  bio: string;
  bioStyling?: Styling;
  photoUrl: string;
  certificates: Certificate[];
  isActive: boolean;
  isApproved: boolean;
  hasPremiumAccess: boolean;
  role: 'admin' | 'member';
  joinedAt: string;
  expiresAt: string;
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};
