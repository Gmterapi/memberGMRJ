
import React from 'react';
import { BalungWesiApp } from './BalungWesiApp';
import { FisioDetectApp } from './FisioDetectApp';

interface PremiumAppProps {
  appId: 1 | 2;
}

export const PremiumApp: React.FC<PremiumAppProps> = ({ appId }) => {
  if (appId === 1) {
    return (
      <div className="w-full h-full min-h-[700px] border border-gold rounded-3xl overflow-hidden bg-[#0F1419] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <BalungWesiApp />
      </div>
    );
  }

  if (appId === 2) {
    return (
      <div className="w-full h-full min-h-[700px] border border-gold rounded-3xl overflow-hidden bg-[#0F1419] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <FisioDetectApp />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] border border-gold rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
      <div className="bg-slate-800 p-3 border-b border-gold flex items-center justify-between">
        <h3 className="font-luxury text-gold text-lg">Aplikasi Premium</h3>
        <span className="text-xs text-slate-400">Mode Kontainer Terkunci</span>
      </div>
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <div id={`app-container-${appId}`} className="text-center">
          <h2 className="text-3xl font-bold mb-4">GMRJ Premium App</h2>
          <p className="text-slate-400 mb-6">Aplikasi premium akan hadir segera.</p>
        </div>
      </div>
    </div>
  );
};
