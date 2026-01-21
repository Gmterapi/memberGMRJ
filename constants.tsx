
import React from 'react';
import { MemberLevel, User } from './types';

export const GOLD_LOGO = (
  <div className="flex flex-col items-center justify-center">
    <svg width="42" height="42" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4af37"/>
          <stop offset="0.5" stopColor="#f9d976"/>
          <stop offset="1" stopColor="#d4af37"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Decorative Outer Rings */}
      <circle cx="60" cy="60" r="56" stroke="url(#goldGradient)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="52" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="1 3" />
      <circle cx="60" cy="60" r="48" stroke="url(#goldGradient)" strokeWidth="2" />
      
      {/* Central Triangle Section */}
      <path d="M60 28L28 82H92L60 28Z" fill="#0f172a" stroke="url(#goldGradient)" strokeWidth="3" />
      
      {/* GM Initials */}
      <text 
        x="60" 
        y="68" 
        textAnchor="middle" 
        fill="url(#goldGradient)" 
        fontSize="24" 
        fontWeight="bold" 
        fontFamily="'Playfair Display', serif"
        filter="url(#glow)"
      >
        GM
      </text>
      
      {/* Small Decorative Dots */}
      <circle cx="60" cy="22" r="1.5" fill="url(#goldGradient)" />
      <circle cx="22" cy="88" r="1.5" fill="url(#goldGradient)" />
      <circle cx="98" cy="88" r="1.5" fill="url(#goldGradient)" />
    </svg>
  </div>
);

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin GMRJ',
    email: 'admin@gmrj.com',
    password: 'admin',
    ktaNumber: '000',
    city: 'Jakarta',
    level: MemberLevel.INSTRUKTUR,
    whatsapp: '08123456789',
    address: 'GMRJ Center, Jakarta',
    bio: 'Administrator sistem Member GMRJ.',
    photoUrl: 'https://picsum.photos/seed/admin/200',
    certificates: [],
    isActive: true,
    isApproved: true,
    hasPremiumAccess: true,
    role: 'admin',
    joinedAt: '2023-01-01',
    expiresAt: '2099-12-31'
  },
  {
    id: '2',
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    password: 'password123',
    ktaNumber: 'GMRJ-001',
    city: 'Bandung',
    level: MemberLevel.ADVANCE,
    whatsapp: '08567891234',
    address: 'Jl. Merdeka No. 10, Bandung',
    bio: 'Praktisi profesional dengan pengalaman 5 tahun.',
    photoUrl: 'https://picsum.photos/seed/budi/200',
    certificates: [
      { id: 'c1', title: 'Sertifikasi Dasar', description: 'Praktisi dasar bersertifikat', imageUrl: 'https://picsum.photos/seed/cert1/400/300' }
    ],
    isActive: true,
    isApproved: true,
    hasPremiumAccess: false,
    role: 'member',
    joinedAt: '2024-01-15',
    expiresAt: '2025-01-15'
  }
];
