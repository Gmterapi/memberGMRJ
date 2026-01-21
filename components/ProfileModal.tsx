
import React from 'react';
import { User, Styling } from '../types';

interface ProfileModalProps {
  member: User;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ member, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getStyleClasses = (s?: Styling) => {
    if (!s) return "";
    return `${s.bold ? 'font-bold' : ''} ${s.italic ? 'italic' : ''} ${s.justify ? 'text-justify' : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-slate-900 border border-gold rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="bg-gold-gradient p-6 flex justify-between items-start">
          <div className="flex gap-4">
            <img 
              src={member.photoUrl} 
              alt={member.name} 
              className="w-20 h-20 rounded-xl object-cover border-2 border-white/50 shadow-lg"
            />
            <div className="text-slate-900">
              <h2 className="text-2xl font-luxury font-bold leading-tight uppercase tracking-tighter">{member.name}</h2>
              <p className="text-sm font-semibold opacity-80">{member.ktaNumber}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {member.level}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.isActive ? 'bg-green-500/30 text-green-950 border border-green-500/30' : 'bg-red-500/30 text-red-950 border border-red-500/30'}`}>
                  {member.isActive ? 'Status: Aktif' : 'Status: Tidak Aktif'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <section>
                <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">Kontak & Lokasi</h3>
                <p className="text-slate-300 text-sm">WhatsApp: <span className="text-slate-100 font-bold">{member.whatsapp}</span></p>
                <p className="text-slate-300 text-sm">Kota: <span className="text-slate-100 font-bold">{member.city}</span></p>
              </section>
              <section>
                <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">Alamat Terdaftar</h3>
                <p className="text-slate-300 text-xs italic leading-relaxed">{member.address || 'Alamat belum diisi.'}</p>
              </section>
            </div>
            <div>
              <section>
                <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">Biografi Praktisi</h3>
                <p className={`text-slate-100 text-sm leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700 min-h-[6rem] ${getStyleClasses(member.bioStyling)}`}>
                  {member.bio || 'Praktisi GMRJ belum mengisi biografi.'}
                </p>
              </section>
            </div>
          </div>

          <section>
            <h3 className="text-gold text-[10px] font-bold uppercase tracking-widest mb-3">Koleksi Sertifikat</h3>
            {member.certificates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {member.certificates.map(cert => (
                  <div key={cert.id} className="bg-slate-800 border border-slate-700 p-2 rounded-lg group hover:border-gold transition-colors">
                    <img src={cert.imageUrl} alt={cert.title} className="w-full h-24 object-cover rounded mb-2 shadow-inner" />
                    <p className="text-[10px] font-bold text-center truncate uppercase tracking-tighter">{cert.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">Belum ada sertifikat yang diunggah.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
