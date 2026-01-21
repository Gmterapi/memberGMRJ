
import React from 'react';
import { User, MemberLevel } from '../types';

interface MemberCardProps {
  member: User;
  onViewProfile: (member: User) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onViewProfile }) => {
  const getLevelBadgeColor = (level: MemberLevel) => {
    switch (level) {
      case MemberLevel.INSTRUKTUR: return 'bg-purple-900 text-purple-200 border-purple-400';
      case MemberLevel.MASTER: return 'bg-red-900 text-red-200 border-red-400';
      case MemberLevel.PROFESIONAL: return 'bg-amber-900 text-amber-200 border-amber-400';
      case MemberLevel.ADVANCE: return 'bg-blue-900 text-blue-200 border-blue-400';
      case MemberLevel.BASIC: return 'bg-green-900 text-green-200 border-green-400';
      default: return 'bg-slate-700 text-slate-300 border-slate-500';
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col items-center group hover:border-gold transition-all duration-300">
      <div className="relative mb-3 md:mb-4">
        <img 
          src={member.photoUrl} 
          alt={member.name} 
          className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-2 border-slate-700 group-hover:border-gold transition-colors"
        />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-slate-900 ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      <h3 className="font-bold text-xs md:text-base text-slate-100 mb-0.5 text-center truncate w-full">{member.name}</h3>
      <p className="text-[8px] md:text-[10px] text-gold font-medium mb-2 md:mb-3 tracking-widest uppercase">{member.ktaNumber}</p>
      
      <div className="flex flex-col gap-1 w-full mt-auto">
        <div className="flex justify-between items-center text-[8px] md:text-[10px]">
          <span className="text-slate-500 uppercase tracking-tighter">Kota:</span>
          <span className="text-slate-200 font-medium">{member.city}</span>
        </div>
        <div className="flex justify-between items-center text-[8px] md:text-[10px]">
          <span className="text-slate-500 uppercase tracking-tighter">Level:</span>
          <span className={`px-1.5 py-0.5 rounded border ${getLevelBadgeColor(member.level)} font-black text-[7px] md:text-[9px] uppercase tracking-tighter`}>
            {member.level}
          </span>
        </div>
        
        <button 
          onClick={() => onViewProfile(member)}
          className="mt-3 w-full py-1.5 md:py-2 bg-slate-800 hover:bg-gold-gradient hover:text-slate-900 text-slate-300 text-[9px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wider"
        >
          Lihat Profil
        </button>
      </div>
    </div>
  );
};
