
import React, { useState, useEffect } from 'react';

const HERBAL_DATA = {
  kayu: { icon: "🌱", nama: "KAYU", herbals: ["A Powder", "B Powder", "C Powder", "GM Fresh", "GM Pace", "Vitamax", "Pendant Wulung"] },
  api: { icon: "🔥", nama: "API", herbals: ["GM Max", "Godogan", "HB Core", "Magic Ring", "New GM Peling", "Pendant Wulung"] },
  logam: { icon: "⚙️", nama: "LOGAM", herbals: ["Pendant Hitam 3D", "GM Oil Besar", "GMS2", "Spoon Kuningan", "HXA GM Dus", "Pendant Wulung"] },
  tanah: { icon: "🌍", nama: "TANAH", herbals: ["Madu GM", "Spray", "Gurah THT", "GM Mustika", "GM SKINCARE", "RPGM", "Pendant Wulung"] },
  air: { icon: "💧", nama: "AIR", herbals: ["Teh Hijau BMT", "Teh Celup GM", "Pheromone", "Pendant Wulung"] }
};

const FISIO: Record<string, any> = {
  "jempol-tangan": { organ: "Paru-paru", elemen: "logam", keluhan: "Batuk, Sesak, Asma" },
  "telunjuk-tangan": { organ: "Usus Besar", elemen: "logam", keluhan: "Sembelit, Diare, Wasir" },
  "tengah-tangan": { organ: "Pembungkus Jantung", elemen: "api", keluhan: "Nyeri Dada, Jantung Berdebar, Emosi" },
  "manis-tangan": { organ: "Tripemanas", elemen: "kayu", keluhan: "Metabolisme Lambat, Gemuk, Lemas" },
  "kelingking-tangan": { organ: "Jantung Kecil", elemen: "api", keluhan: "Gangguan Tidur, Konsentrasi Drop" },
  "jempol-kaki-luar": { organ: "Limpa", elemen: "tanah", keluhan: "Nafsu Makan Hilang, Pencernaan Lemah" },
  "jempol-kaki-dalam": { organ: "Liver (Hati)", elemen: "kayu", keluhan: "Emosi Tidak Stabil, Mata Lelah" },
  "telunjuk-kaki": { organ: "Lambung Atas", elemen: "tanah", keluhan: "Maag, Mual, Asam Lambung" },
  "antara-telunjuk-tengah-kaki": { organ: "Lambung Tengah", elemen: "tanah", keluhan: "Perut Penuh, Sulit BAB" },
  "tengah-kaki": { organ: "Lambung Bawah", elemen: "tanah", keluhan: "Diare, Sembelit Kronis" },
  "manis-kaki": { organ: "Kandung Empedu", elemen: "kayu", keluhan: "Pahit Mulut, Sakit Kepala Kanan" },
  "kelingking-kaki": { organ: "Kandung Kemih", elemen: "air", keluhan: "Anyang-anyangan, Sering Kencing Malam" },
  "telapak-kaki": { organ: "Ginjal", elemen: "air", keluhan: "Sakit Pinggang, Reproduksi Lemah" }
};

export const FisioDetectApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('diagnosa');
  const [clientData, setClientData] = useState({ nama: '', alamat: '', keluhan: '', wa: '' });
  const [showFisioGrid, setShowFisioGrid] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gmrj_premium_fisiodetect_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleStartDiagnosa = () => {
    if (!clientData.nama || !clientData.wa) return alert("Mohon isi Nama dan Nomor WhatsApp klien!");
    setShowFisioGrid(true);
  };

  const handleSelectPart = (key: string) => {
    setSelectedPart(key);
  };

  const saveToHistory = () => {
    if (!selectedPart) return;
    const partData = FISIO[selectedPart];
    const herbal = HERBAL_DATA[partData.elemen as keyof typeof HERBAL_DATA];
    
    const entry = {
      ...clientData,
      id: Date.now(),
      tanggal: new Date().toLocaleDateString('id-ID'),
      diagnosa: `${selectedPart} (${partData.organ})`,
      elemen: herbal.nama,
      herbals: herbal.herbals.join(', ')
    };

    const newHistory = [entry, ...history];
    setHistory(newHistory);
    localStorage.setItem('gmrj_premium_fisiodetect_history', JSON.stringify(newHistory));
    alert("Data berhasil disimpan ke riwayat!");
    setActiveTab('riwayat');
  };

  const deleteHistory = (id: number) => {
    if (!confirm("Hapus data riwayat ini?")) return;
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('gmrj_premium_fisiodetect_history', JSON.stringify(newHistory));
  };

  const shareWA = (item: any) => {
    const text = `Halo Kak *${item.nama}*,%0A%0ABerdasarkan diagnosa *FisioDetect GMRJ*:%0A🏥 *Bagian:* ${item.diagnosa}%0A🧬 *Elemen:* ${item.elemen}%0A%0A*Rekomendasi Herbal GMRJ:*%0A${item.herbals}%0A%0ASemoga lekas sembuh. Salam GMRJ!`;
    window.open(`https://wa.me/${item.wa}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#0F1419] text-[#e0e0e0] p-4 md:p-6 rounded-xl border border-[#D4AF37]/30 font-sans h-full overflow-y-auto">
      <header className="text-center mb-6 p-4 bg-gradient-to-br from-[#8B4513]/30 to-[#D4AF37]/10 rounded-2xl border-2 border-[#D4AF37]">
        <h1 className="text-xl md:text-2xl font-bold text-[#D4AF37] mb-1">🔮 FisioDetect GMRJ</h1>
        <p className="text-[10px] md:text-xs text-[#b0b0b0]">Gusmus Raksa Jasad - Analisa Syaraf & Pemetaan Herbal</p>
      </header>

      <div className="flex gap-2 mb-6 border-b border-[#D4AF37]/30">
        <button onClick={() => setActiveTab('diagnosa')} className={`px-4 py-2 text-xs font-bold uppercase ${activeTab === 'diagnosa' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-500'}`}>Diagnosa</button>
        <button onClick={() => setActiveTab('riwayat')} className={`px-4 py-2 text-xs font-bold uppercase ${activeTab === 'riwayat' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-slate-500'}`}>Riwayat Klien</button>
      </div>

      {activeTab === 'diagnosa' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-[#1a1f28] p-5 rounded-xl border border-[#D4AF37]/20">
            <h3 className="text-[#D4AF37] text-xs font-bold uppercase mb-4 tracking-widest">📝 Data Klien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#D4AF37] uppercase mb-1 block">Nama Lengkap</label>
                <input type="text" value={clientData.nama} onChange={e => setClientData({...clientData, nama: e.target.value})} className="w-full bg-black/20 border border-[#D4AF37]/30 rounded-lg p-2 text-sm outline-none focus:border-[#D4AF37]" placeholder="Nama Klien" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#D4AF37] uppercase mb-1 block">WhatsApp (62...)</label>
                <input type="text" value={clientData.wa} onChange={e => setClientData({...clientData, wa: e.target.value})} className="w-full bg-black/20 border border-[#D4AF37]/30 rounded-lg p-2 text-sm outline-none focus:border-[#D4AF37]" placeholder="628xxx" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-[#D4AF37] uppercase mb-1 block">Keluhan Utama</label>
                <input type="text" value={clientData.keluhan} onChange={e => setClientData({...clientData, keluhan: e.target.value})} className="w-full bg-black/20 border border-[#D4AF37]/30 rounded-lg p-2 text-sm outline-none focus:border-[#D4AF37]" placeholder="Contoh: Sesak Napas, Maag" />
              </div>
            </div>
            {!showFisioGrid && (
              <button onClick={handleStartDiagnosa} className="w-full mt-4 py-3 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white font-bold rounded-lg uppercase text-xs tracking-widest">🔍 Mulai Diagnosa</button>
            )}
          </div>

          {showFisioGrid && (
            <div className="bg-[#1a1f28] p-5 rounded-xl border border-[#D4AF37]/40 shadow-2xl animate-in slide-in-from-bottom duration-500">
              <h3 className="text-center text-[#D4AF37] text-sm font-bold uppercase mb-6 tracking-tighter">👆 Pilih Titik Syaraf yang Sakit</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-[9px] text-[#D4AF37] font-bold uppercase border-b border-[#D4AF37]/20 mb-3 pb-1">✋ Titik Jari Tangan</div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {["jempol-tangan", "telunjuk-tangan", "tengah-tangan", "manis-tangan", "kelingking-tangan"].map(k => (
                      <button key={k} onClick={() => handleSelectPart(k)} className={`p-2 rounded-lg text-[10px] font-bold border transition-all ${selectedPart === k ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/20 border-slate-700 text-slate-400 hover:border-[#D4AF37]'}`}>
                        {k.split('-')[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] text-[#D4AF37] font-bold uppercase border-b border-[#D4AF37]/20 mb-3 pb-1">🦶 Titik Jari & Telapak Kaki</div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {["jempol-kaki-luar", "jempol-kaki-dalam", "telunjuk-kaki", "antara-telunjuk-tengah-kaki", "tengah-kaki", "manis-kaki", "kelingking-kaki", "telapak-kaki"].map(k => (
                      <button key={k} onClick={() => handleSelectPart(k)} className={`p-2 rounded-lg text-[9px] font-bold border transition-all ${selectedPart === k ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/20 border-slate-700 text-slate-400 hover:border-[#D4AF37]'}`}>
                        {k.replace(/-/g, ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedPart && (
                <div className="mt-8 p-5 bg-black/30 rounded-xl border-l-4 border-[#D4AF37] animate-in zoom-in duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{HERBAL_DATA[FISIO[selectedPart].elemen as keyof typeof HERBAL_DATA].icon}</span>
                    <h4 className="text-[#D4AF37] font-bold uppercase text-sm">Organ: {FISIO[selectedPart].organ}</h4>
                  </div>
                  <p className="text-xs text-slate-300 mb-4 italic">Potensi Masalah: {FISIO[selectedPart].keluhan}</p>
                  
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-[#D4AF37] uppercase mb-2">💊 Rekomendasi Herbal GMRJ:</p>
                    <div className="flex flex-wrap gap-1">
                      {HERBAL_DATA[FISIO[selectedPart].elemen as keyof typeof HERBAL_DATA].herbals.map(h => (
                        <span key={h} className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded text-[9px] font-bold border border-[#D4AF37]/20">{h}</span>
                      ))}
                    </div>
                  </div>

                  <button onClick={saveToHistory} className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-lg text-xs uppercase tracking-widest shadow-lg">💾 Simpan ke Riwayat Klien</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {history.length > 0 ? history.map(h => (
            <div key={h.id} className="bg-[#1a1f28] p-4 rounded-xl border border-slate-800 hover:border-[#D4AF37]/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-[#D4AF37]">{h.nama}</h4>
                  <p className="text-[10px] text-slate-500 uppercase">{h.tanggal}</p>
                </div>
                <button onClick={() => deleteHistory(h.id)} className="text-red-500 hover:text-red-400">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="space-y-2 text-xs">
                 <p><span className="text-slate-500">Diagnosa:</span> <span className="text-slate-200 font-bold">{h.diagnosa}</span></p>
                 <p><span className="text-slate-500">Herbals:</span> <span className="text-[#D4AF37]">{h.herbals}</span></p>
              </div>
              <button onClick={() => shareWA(h)} className="w-full mt-4 py-2 bg-green-900/40 text-green-400 border border-green-800 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                 Kirim ke WhatsApp Klien
              </button>
            </div>
          )) : <div className="text-center py-20 text-slate-500 italic">Belum ada riwayat diagnosa klien.</div>}
        </div>
      )}
    </div>
  );
};
