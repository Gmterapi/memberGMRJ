
import React, { useState, useEffect } from 'react';

const HERBAL_DATA = {
  kayu: { icon: "🌱", nama: "KAYU", deskripsi: "Pertumbuhan & Vitalitas", naptu: [1, 6], herbals: ["A Powder", "B Powder", "C Powder", "GM Fresh", "GM Pace", "Vitamax", "Pendant Wulung"] },
  api: { icon: "🔥", nama: "API", deskripsi: "Energi & Semangat", naptu: [2, 7], herbals: ["GM Max", "Godogan", "HB Core", "Magic Ring", "New GM Peling", "Pendant Wulung"] },
  logam: { icon: "⚙️", nama: "LOGAM", deskripsi: "Ketajaman & Proteksi", naptu: [3, 8], herbals: ["Pendant Hitam 3D", "GM Oil Besar", "GMS2", "Spoon Kuningan", "HXA GM Dus", "Pendant Wulung"] },
  tanah: { icon: "🌍", nama: "TANAH", deskripsi: "Stabilitas & Fondasi", naptu: [4, 9], herbals: ["Madu GM", "Spray", "Gurah THT", "GM Mustika", "GM SKINCARE", "RPGM", "Pendant Wulung"] },
  air: { icon: "💧", nama: "AIR", deskripsi: "Ketenangan & Penyeimbang", naptu: [5, 10], herbals: ["Teh Hijau BMT", "Teh Celup GM", "Pheromone", "Pendant Wulung"] }
};

const NAPTU_DATA: Record<number, any> = {
  1: { nama: "Pandita Soca", deskripsi: "Cerdas, bijaksana, dapat diandalkan, pemimpin alami dengan inisiatif tinggi", kelebihan: "Kepemimpinan alami, inisiatif tinggi, bijaksana, dapat diandalkan, visioner", areaPengembangan: "Terkadang kurang sabar, perlu belajar mendengarkan masukan orang lain lebih terbuka", rekomendasi: "Cocok jadi pemimpin, entrepreneur, atau konsultan strategis. Kembangkan soft skill komunikasi.", warna: ["Merah", "Emas"], elemen: "kayu", pekerjaan: "Memimpin transformasi organisasi dengan visi strategis yang jelas. Membangun ekosistem kepemimpinan yang berkelanjutan melalui mentoring dan pengembangan tim. Menciptakan dampak positif yang terukur dalam industri melalui inovasi dan keputusan strategis." },
  2: { nama: "Pandita Bangun Teki", deskripsi: "Penghasilan melimpah, pekerja keras, mudah bergaul, jiwa seni tinggi", kelebihan: "Kerja keras, produktif, mudah bergaul, artistik, penghasilan menjanjikan", areaPengembangan: "Perlu fokus lebih, terkadang terlalu fleksibel, perlu prioritas yang lebih jelas", rekomendasi: "Cocok di bidang seni, bisnis kreatif, atau sales. Kembangkan fokus dan disiplin.", warna: ["Hijau", "Biru"], elemen: "api", pekerjaan: "Mengekspresikan kreativitas melalui karya yang bermakna dan berkelanjutan. Membangun merek pribadi yang kuat dengan fokus pada niche spesifik. Menciptakan sumber penghasilan yang beragam dan berkelanjutan dari passion dan keahlian kreatif." },
  3: { nama: "Pandita Nagari", deskripsi: "Tanggung jawab tinggi, loyal, pembicara persuasif, penuh dedikasi", kelebihan: "Tanggung jawab tinggi, loyal, persuasif, berdedikasi, dipercaya", areaPengembangan: "Terkadang terlalu serius, perlu lebih fleksibel, belajar santai", rekomendasi: "Cocok jadi pemimpin tim, negosiator, atau public speaker. Jangan lupa relaksasi.", warna: ["Kuning", "Putih"], elemen: "logam", pekerjaan: "Membangun kepercayaan dan kredibilitas melalui keahlian dan integritas yang konsisten. Berbagi pengetahuan dan pengalaman untuk menginspirasi dan membimbing generasi berikutnya. Meninggalkan warisan positif yang berdampak jangka panjang bagi komunitas dan organisasi." },
  4: { nama: "Pandita Tagal", deskripsi: "Ceria, kreatif, mudah beradaptasi, menyenangkan dan populer", kelebihan: "Ceria, kreatif, adaptif, populer, baik untuk networking", areaPengembangan: "Perlu lebih dalam, terkadang terlalu permukaan, fokus pada detail", rekomendasi: "Cocok jadi entertainer, marketer, atau event organizer. Perdalam keahlian Anda.", warna: ["Oranye", "Merah Muda"], elemen: "tanah", pekerjaan: "Menghibur, menginspirasi, dan membangun komunitas yang solid melalui konten berkualitas tinggi. Menciptakan pengalaman yang berkesan dan autentik bagi audiens. Mengembangkan pengaruh positif dan daya tarik yang konsisten di platform dan niche pilihan." },
  5: { nama: "Pandita Kalimah", deskripsi: "Intuitif, spiritual, pendengar baik, empati tinggi terhadap sesama", kelebihan: "Intuitif, empatik, spiritual, pendengar baik, peka terhadap orang lain", areaPengembangan: "Terlalu emosional, perlu belajar menjaga batas, tidak menyerap semua energi orang", rekomendasi: "Cocok jadi konselor, healer, atau spiritual guide. Jaga energi spiritual Anda.", warna: ["Ungu", "Biru Tua"], elemen: "air", pekerjaan: "Melayani dan menyembuhkan melalui pendekatan holistik yang menggabungkan intuisi dan keterampilan profesional. Menciptakan ruang aman bagi orang lain untuk tumbuh dan menemukan ketenangan batin. Menjadi pemandu spiritual yang bijaksana dengan menjaga keseimbangan energi dan kesehatan diri sendiri." },
  6: { nama: "Pandita Saring", deskripsi: "Bertanggung jawab, suka membantu, harmonis, baik hati dan peduli", kelebihan: "Bertanggung jawab, penolong, harmonis, baik hati, peduli lingkungan", areaPengembangan: "Terlalu banyak memberi, perlu belajar berkata tidak, jaga energi sendiri", rekomendasi: "Cocok di bidang sosial, pendidikan, atau perawatan. Ingat untuk self-care.", warna: ["Biru Muda", "Hijau Sage"], elemen: "kayu", pekerjaan: "Memberdayakan dan melayani masyarakat dengan pendekatan yang berkelanjutan dan bermartabat. Menciptakan harmoni dalam hubungan sambil menjaga keseimbangan antara memberi dan menerima. Membangun sistem dukungan yang efektif untuk membantu lebih banyak orang secara efisien dan berkelanjutan." },
  7: { nama: "Pandita Pukak", deskripsi: "Analitis, teliti, berpikir mendalam, independen dan mandiri", kelebihan: "Analitis, teliti, pemikir mendalam, independen, fokus pada detail", areaPengembangan: "Terlalu dalam pikiran, perlu lebih sosial, belajar bekerja sama tim", rekomendasi: "Cocok di research, IT, engineering, atau akademik. Jangan terlalu terisolasi.", warna: ["Putih", "Abu-abu"], elemen: "api", pekerjaan: "Mengembangkan solusi inovatif melalui riset mendalam dan analisis yang cermat. Berkontribusi pada kemajuan industri dengan pengetahuan dan keahlian teknis yang solid. Berbagi wawasan kompleks dengan cara yang mudah dipahami untuk menciptakan dampak yang lebih luas." },
  8: { nama: "Pandita Lusi", deskripsi: "Ambisius, visioner, pemimpin alami, determinasi tinggi menghadapi tantangan", kelebihan: "Ambisius, visioner, determinasi luar biasa, pemimpin natural, kuat hadapi tantangan", areaPengembangan: "Terlalu kontrol, perlu delegasi lebih, belajar membuka diri terhadap ide tim", rekomendasi: "Cocok jadi CEO, entrepreneur, atau pemimpin proyek besar. Percayai tim Anda.", warna: ["Merah", "Emas Tua"], elemen: "logam", pekerjaan: "Mewujudkan visi besar melalui kepemimpinan yang visioner dan strategis. Membangun organisasi atau bisnis yang kokoh, berkelanjutan, dan berdampak signifikan. Membimbing tim menuju kesuksesan bersama sambil mengembangkan pemimpin-pemimpin masa depan yang kompeten." },
  9: { nama: "Pandita Saking", deskripsi: "Kasih sayang universal, perfeksionis, idealis, mampu melihat gambaran besar", kelebihan: "Kasih sayang universal, perfeksionis, idealis, big picture thinker, inspiratif", areaPengembangan: "Terlalu perfeksionis, perlu belajar accepting imperfections, kurangi perfectionism", rekomendasi: "Cocok jadi visioner, mentor, atau philanthropist. Terimalah ketidaksempurnaan.", warna: ["Biru Laut", "Emas"], elemen: "tanah", pekerjaan: "Menginspirasi perubahan positif melalui visi holistik dan nilai-nilai universal. Membangun gerakan sosial yang bermakna untuk menciptakan dampak jangka panjang bagi kemanusiaan. Memberdayakan individu lain untuk mewujudkan potensi penuh mereka melalui mentoring dan kepemimpinan yang penuh kasih sayang." },
  10: { nama: "Pandita Tunggal", deskripsi: "Fokus luar biasa, prestasi tinggi, konsisten, integritas dan kehormatan tinggi", kelebihan: "Fokus luar biasa, prestasi tinggi, konsisten, integritas tinggi, honor dan disiplin", areaPengembangan: "Terlalu rigid, perlu lebih fleksibel, belajar adapt dengan perubahan", rekomendasi: "Cocok jadi champion, specialist, atau expert. Jangan terlalu kaku terhadap perubahan.", warna: ["Hitam", "Silver"], elemen: "air", pekerjaan: "Mencapai keunggulan melalui dedikasi, disiplin, dan integritas yang tidak tergoyahkan. Membangun reputasi yang solid dan dapat dipercaya dalam bidang keahlian spesifik. Meninggalkan standar tinggi dan warisan kualitas yang menginspirasi generasi profesional berikutnya." }
};

export const BalungWesiApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [hasil, setHasil] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gmrj_premium_balungwesi_riwayat');
    if (saved) setRiwayat(JSON.parse(saved));
  }, []);

  const getDayName = (date: Date) => ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
  const getPasaran = (date: Date) => {
    const pasarans = ['Kliwon', 'Legi', 'Pahing', 'Pon', 'Wage'];
    const days = Math.floor((date.getTime() - new Date('1900-01-01').getTime()) / (24 * 60 * 60 * 1000));
    return pasarans[days % 5];
  };
  const getNaptuHari = (date: Date) => date.getDay() === 0 ? 7 : date.getDay();
  const getNaptuPasaran = (pasaran: string) => ({ 'Kliwon': 1, 'Legi': 2, 'Pahing': 3, 'Pon': 4, 'Wage': 5 } as any)[pasaran];
  
  const handleHitung = () => {
    if (!tanggalLahir) return alert("Pilih tanggal lahir!");
    const date = new Date(tanggalLahir);
    const hari = getDayName(date);
    const pasaran = getPasaran(date);
    const nHari = getNaptuHari(date);
    const nPasaran = getNaptuPasaran(pasaran);
    const nTotal = ((nHari + nPasaran - 1) % 10) + 1;
    
    setHasil({
      hari, pasaran, naptuHari: nHari, naptuPasaran: nPasaran, naptuTotal: nTotal,
      karakter: NAPTU_DATA[nTotal]
    });
  };

  const simpanRiwayat = () => {
    if (!hasil) return;
    const entry = { ...hasil, nama, tanggalLahir, id: Date.now(), timestamp: new Date().toLocaleString('id-ID') };
    const newRiwayat = [...riwayat, entry];
    setRiwayat(newRiwayat);
    localStorage.setItem('gmrj_premium_balungwesi_riwayat', JSON.stringify(newRiwayat));
    alert("Berhasil disimpan!");
  };

  const deleteEntry = (id: number) => {
    const newRiwayat = riwayat.filter(r => r.id !== id);
    setRiwayat(newRiwayat);
    localStorage.setItem('gmrj_premium_balungwesi_riwayat', JSON.stringify(newRiwayat));
  };

  return (
    <div className="bg-[#0F1419] text-[#e0e0e0] p-4 md:p-6 rounded-xl border border-[#D4AF37]/30 font-sans h-full overflow-y-auto">
      <header className="text-center mb-8 p-6 bg-gradient-to-br from-[#8B4513]/30 to-[#D4AF37]/10 rounded-2xl border-2 border-[#D4AF37]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-2 drop-shadow-md">🔮 Kalkulator Balung Wesi GM</h1>
        <p className="text-xs md:text-sm text-[#b0b0b0]">Paririmbon Sunda - Perhitungan Otomatis Naptu & Pandita</p>
      </header>

      <div className="flex gap-2 mb-6 border-b-2 border-[#D4AF37] overflow-x-auto pb-1 no-scrollbar">
        {['kalkulator', 'riwayat', 'statistik', 'referensi'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs md:text-sm font-bold uppercase transition-all whitespace-nowrap border-b-4 ${activeTab === tab ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-[#b0b0b0] border-transparent hover:text-[#D4AF37]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'kalkulator' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-[#1a1f28] p-6 rounded-xl border border-[#D4AF37]/20 shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase mb-1">👤 Nama (Opsional)</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Masukkan nama" className="w-full bg-[#D4AF37]/5 border border-[#D4AF37] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase mb-1">📅 Tanggal Lahir</label>
                <input type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} className="w-full bg-[#D4AF37]/5 border border-[#D4AF37] rounded-lg p-3 text-sm focus:outline-none text-white invert-calendar" />
              </div>
              <button onClick={handleHitung} className="w-full py-4 bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">🔮 HITUNG KARAKTER</button>
            </div>
          </div>

          {hasil && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { l: 'Hari', v: hasil.hari },
                  { l: 'Pasaran', v: hasil.pasaran },
                  { l: 'Naptu Hari', v: hasil.naptuHari },
                  { l: 'Naptu Pasaran', v: hasil.naptuPasaran },
                  { l: 'NAPTU TOTAL', v: hasil.naptuTotal, gold: true }
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border-l-4 border-[#D4AF37] bg-[#1a1f28] ${item.gold ? 'ring-2 ring-[#D4AF37]/50' : ''}`}>
                    <h3 className="text-[10px] uppercase text-[#D4AF37] mb-1 font-bold">{item.l}</h3>
                    <div className={`text-lg font-bold ${item.gold ? 'text-[#D4AF37] text-2xl' : 'text-white'}`}>{item.v}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a1f28] p-6 rounded-xl border-2 border-[#D4AF37] shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                  <div className={`w-20 h-20 rounded-full border-4 border-[#D4AF37] flex items-center justify-center text-3xl font-bold bg-[#D4AF37]/10`}>{hasil.naptuTotal}</div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-[#D4AF37] mb-1">{hasil.karakter.nama}</h2>
                    <p className="text-sm text-[#b0b0b0] italic">{hasil.karakter.deskripsi}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="bg-[#D4AF37]/5 p-4 rounded-lg border-l-4 border-[#D4AF37]">
                    <h4 className="text-[#D4AF37] text-xs font-bold uppercase mb-2">✅ KELEBIHAN & POTENSI</h4>
                    <p className="text-sm leading-relaxed">{hasil.karakter.kelebihan}</p>
                  </div>
                  <div className="bg-[#D4AF37]/5 p-4 rounded-lg border-l-4 border-[#D4AF37]">
                    <h4 className="text-[#D4AF37] text-xs font-bold uppercase mb-2">⚠️ AREA PENGEMBANGAN</h4>
                    <p className="text-sm leading-relaxed">{hasil.karakter.areaPengembangan}</p>
                  </div>
                  <div className="bg-[#D4AF37]/5 p-4 rounded-lg border-l-4 border-[#D4AF37]">
                    <h4 className="text-[#D4AF37] text-xs font-bold uppercase mb-2">🎨 WARNA KEBERUNTUNGAN</h4>
                    <div className="flex flex-wrap gap-2">
                      {hasil.karakter.warna.map((w: string) => <span key={w} className="bg-[#D4AF37] text-black px-3 py-1 rounded-full text-[10px] font-bold">{w}</span>)}
                    </div>
                  </div>
                  <div className="bg-[#D4AF37]/5 p-4 rounded-lg border-l-4 border-[#D4AF37]">
                    <h4 className="text-[#D4AF37] text-xs font-bold uppercase mb-2">💊 REKOMENDASI HERBAL GM</h4>
                    <div className="flex flex-wrap gap-2">
                      {HERBAL_DATA[hasil.karakter.elemen as keyof typeof HERBAL_DATA].herbals.map(h => <span key={h} className="bg-slate-700 text-[#D4AF37] px-3 py-1 rounded-lg text-[10px] font-bold border border-[#D4AF37]/30">{h}</span>)}
                    </div>
                  </div>
                </div>

                <button onClick={simpanRiwayat} className="w-full mt-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-lg font-bold transition-all uppercase tracking-widest text-xs">💾 Simpan ke Riwayat</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="space-y-4 animate-in fade-in duration-500 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-[#8B4513] text-[#D4AF37] font-bold uppercase border-b-2 border-[#D4AF37]">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Lahir</th>
                <th className="p-3">Naptu</th>
                <th className="p-3">Karakter</th>
                <th className="p-3">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/20">
              {riwayat.length > 0 ? riwayat.map(r => (
                <tr key={r.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                  <td className="p-3 font-bold">{r.nama || '-'}</td>
                  <td className="p-3">{r.tanggalLahir}</td>
                  <td className="p-3 font-mono font-bold text-[#D4AF37]">{r.naptuTotal}</td>
                  <td className="p-3">{r.karakter.nama}</td>
                  <td className="p-3"><button onClick={() => deleteEntry(r.id)} className="text-red-500 underline uppercase text-[10px] font-bold">Hapus</button></td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-10 text-center text-slate-500 italic">Belum ada riwayat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'referensi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
          {Object.entries(NAPTU_DATA).map(([num, data]) => (
            <div key={num} className="bg-[#1a1f28] p-4 rounded-xl border-l-4 border-[#D4AF37]">
              <h3 className="text-[#D4AF37] font-bold mb-2">🔮 {num}. {data.nama}</h3>
              <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">{data.deskripsi}</p>
              <div className="flex flex-wrap gap-1">
                {data.warna.map((w: string) => <span key={w} className="text-[8px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20">{w}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'statistik' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-[#1a1f28] p-6 rounded-xl border border-[#D4AF37] text-center">
                <p className="text-xs text-[#b0b0b0] mb-2 uppercase font-bold">Total Hitung</p>
                <div className="text-4xl font-bold text-[#D4AF37]">{riwayat.length}</div>
             </div>
             <div className="bg-[#1a1f28] p-6 rounded-xl border border-[#D4AF37] text-center md:col-span-2">
                <p className="text-xs text-[#b0b0b0] mb-2 uppercase font-bold">Integritas Data GMRJ</p>
                <p className="text-[10px] italic text-slate-400">Gunakan aplikasi premium untuk analisis personal yang lebih mendalam sesuai standar organisasi.</p>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        .invert-calendar::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
