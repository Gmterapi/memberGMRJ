
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MemberLevel, User, Announcement, AuthState, Training, ClinicPost, Certificate } from './types';
import { GOLD_LOGO } from './constants';
import { MemberCard } from './components/MemberCard';
import { ProfileModal } from './components/ProfileModal';
import { PremiumApp } from './components/PremiumApp';
import { db, auth, storage } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc,
  updateDoc, 
  query, 
  where,
  getDocs,
  deleteDoc,
  addDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const App: React.FC = () => {
  // --- STATE UTAMA ---
  const [view, setView] = useState<'home' | 'dasbor' | 'admin'>('home');
  const [homeTab, setHomeTab] = useState<'anggota' | 'klinik' | 'pelatihan'>('anggota');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [users, setUsers] = useState<User[]>([]);
  const [clinics, setClinics] = useState<ClinicPost[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // --- SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLevel, setSearchLevel] = useState<MemberLevel | ''>('');

  // --- MODAL & UI STATE ---
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [premiumAppId, setPremiumAppId] = useState<1 | 2 | null>(null);
  const [dasborTab, setDasborTab] = useState<'profil' | 'sertifikat' | 'konten' | 'premium' | 'pengumuman'>('profil');
  const [activeContentTab, setActiveContentTab] = useState<'klinik' | 'pelatihan'>('klinik');

  // --- ADMIN MANAGEMENT STATE ---
  const [adminSubTab, setAdminSubTab] = useState<'anggota' | 'pengumuman'>('anggota');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'all' | string>('all');

  // Form States
  const [ktaInput, setKtaInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regData, setRegData] = useState({ name: '', email: '', kta: '', city: '', whatsapp: '', pass: '' });

  // --- HELPER UPLOAD ---
  const uploadFile = async (file: File, path: string): Promise<string> => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah gambar.");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 1. EFFECT: Menangani Perubahan Autentikasi & Cek Expiry
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userSnap = await getDoc(doc(db, "users", fbUser.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            const now = new Date();
            const expiry = new Date(userData.expiresAt);
            
            if (now > expiry) {
              alert("Masa berlaku akun Anda telah habis.");
              await signOut(auth);
              setView('home');
              return;
            }

            if (userData.role === 'admin' || (userData.isApproved && userData.isActive)) {
              setAuthState({ user: userData, isAuthenticated: true });
            } else {
              setAuthState({ user: null, isAuthenticated: false });
              await signOut(auth);
              setView('home');
              if (!showRegister) alert("Akun belum aktif atau dalam verifikasi Admin.");
            }
          }
        } catch (error) {
          setAuthState({ user: null, isAuthenticated: false });
          setView('home');
        }
      } else {
        setAuthState({ user: null, isAuthenticated: false });
        setClinics([]);
        setTrainings([]);
        setAnnouncements([]);
        setView('home');
      }
      setLoading(false);
    });
    return () => unsubAuth();
  }, [showRegister]);

  // 2. EFFECT: Listener Firestore
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), 
      (s) => setUsers(s.docs.map(d => d.data() as User)),
      (err) => console.warn("Users listener denied.")
    );

    let unsubClinics = () => {};
    let unsubTrainings = () => {};
    let unsubAnn = () => {};

    if (authState.isAuthenticated) {
      unsubClinics = onSnapshot(collection(db, "clinics"), 
        (s) => setClinics(s.docs.map(d => ({...d.data(), id: d.id}) as ClinicPost)),
        (err) => console.error("Clinics error:", err)
      );

      unsubTrainings = onSnapshot(collection(db, "trainings"), 
        (s) => setTrainings(s.docs.map(d => ({...d.data(), id: d.id}) as Training)),
        (err) => console.error("Trainings error:", err)
      );

      unsubAnn = onSnapshot(query(collection(db, "announcements"), orderBy("createdAt", "desc")), 
        (s) => setAnnouncements(s.docs.map(d => ({...d.data(), id: d.id}) as Announcement)),
        (err) => console.error("Announcements error:", err)
      );
    }

    return () => { 
      unsubUsers(); 
      unsubClinics(); 
      unsubTrainings(); 
      unsubAnn(); 
    };
  }, [authState.isAuthenticated]);

  // --- NOTIFICATION LOGIC ---
  const generalAnnouncements = useMemo(() => announcements.filter(a => !a.targetMemberId), [announcements]);
  const privateAnnouncements = useMemo(() => {
    if (!authState.user) return [];
    return announcements.filter(a => a.targetMemberId === authState.user!.id);
  }, [announcements, authState.user]);
  
  const hasNotifications = useMemo(() => {
    return generalAnnouncements.length > 0 || privateAnnouncements.length > 0;
  }, [generalAnnouncements, privateAnnouncements]);

  const filteredMembers = useMemo(() => {
    const lowSearch = searchTerm.toLowerCase();
    return users.filter(u => {
      if (authState.user?.role !== 'admin' && (!u.isApproved || !u.isActive)) return false;
      
      const matchSearch = searchTerm === '' || 
        u.name.toLowerCase().includes(lowSearch) || 
        u.ktaNumber.toLowerCase().includes(lowSearch) || 
        u.city.toLowerCase().includes(lowSearch);
        
      const matchLevel = searchLevel === '' || u.level === searchLevel;
      
      return matchSearch && matchLevel;
    });
  }, [users, searchTerm, searchLevel, authState.user]);

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "users"), where("ktaNumber", "==", ktaInput));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("Nomor KTA tidak ditemukan.");
      const targetUser = querySnapshot.docs[0].data() as User;
      await signInWithEmailAndPassword(auth, targetUser.email, passwordInput);
      setShowLogin(false);
    } catch (err: any) { alert(err.message); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "users"), where("ktaNumber", "==", regData.kta));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) throw new Error("Nomor KTA sudah terdaftar.");
      const userCredential = await createUserWithEmailAndPassword(auth, regData.email, regData.pass);
      const fbUser = userCredential.user;
      const newUser: User = {
        id: fbUser.uid,
        name: regData.name,
        email: regData.email,
        ktaNumber: regData.kta,
        city: regData.city,
        whatsapp: regData.whatsapp,
        level: MemberLevel.MAGANG,
        address: '', bio: '',
        photoUrl: 'https://via.placeholder.com/150',
        certificates: [],
        isActive: false, isApproved: false, hasPremiumAccess: false,
        role: 'member',
        joinedAt: new Date().toISOString(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      };
      await setDoc(doc(db, "users", fbUser.uid), newUser);
      setRegSuccess(true);
      await signOut(auth);
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user) return;
    try {
      await updateDoc(doc(db, "users", authState.user.id), {
        name: authState.user.name,
        city: authState.user.city,
        whatsapp: authState.user.whatsapp,
        bio: authState.user.bio,
        address: authState.user.address,
        photoUrl: authState.user.photoUrl
      });
      alert("Profil diperbarui!");
    } catch (err) { alert("Gagal memperbarui."); }
  };

  const approveUser = async (id: string) => { try { await updateDoc(doc(db, "users", id), { isApproved: true, isActive: true }); } catch (err) { alert("Gagal."); } };
  const toggleUserStatus = async (id: string, current: boolean) => { try { await updateDoc(doc(db, "users", id), { isActive: !current }); } catch (err) { alert("Gagal."); } };
  const togglePremium = async (id: string, current: boolean) => { try { await updateDoc(doc(db, "users", id), { hasPremiumAccess: !current }); } catch (err) { alert("Gagal."); } };
  
  const handleAdminUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.id), { ...editingUser });
      alert("Data Member berhasil diperbarui!");
      setEditingUser(null);
    } catch (err) { alert("Gagal memperbarui data member."); }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg) return;
    try {
      await addDoc(collection(db, "announcements"), {
        message: announcementMsg,
        targetMemberId: announcementTarget === 'all' ? null : announcementTarget,
        createdAt: new Date().toISOString()
      });
      setAnnouncementMsg('');
      alert("Pengumuman berhasil diterbitkan!");
    } catch (e) { alert("Gagal menerbitkan pengumuman."); }
  };

  const [certForm, setCertForm] = useState({ title: '', description: '', imageUrl: '' });
  const handleCertFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0], 'certificates');
      setCertForm({ ...certForm, imageUrl: url });
    }
  };
  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user || !certForm.imageUrl) return alert("Pilih foto sertifikat!");
    const newCert: Certificate = { ...certForm, id: Date.now().toString() };
    const updatedCerts = [...authState.user.certificates, newCert];
    try {
      await updateDoc(doc(db, "users", authState.user.id), { certificates: updatedCerts });
      setAuthState({...authState, user: {...authState.user, certificates: updatedCerts}});
      setCertForm({ title: '', description: '', imageUrl: '' });
      alert("Sertifikat ditambah!");
    } catch (err) { alert("Gagal."); }
  };

  const removeCertificate = async (certId: string) => {
    if (!authState.user) return;
    if (!confirm("Hapus sertifikat ini?")) return;
    const updatedCerts = authState.user.certificates.filter(c => c.id !== certId);
    try {
      await updateDoc(doc(db, "users", authState.user.id), { certificates: updatedCerts });
      setAuthState({...authState, user: {...authState.user, certificates: updatedCerts}});
      alert("Sertifikat dihapus!");
    } catch (err) { alert("Gagal menghapus sertifikat."); }
  };

  const [contentForm, setContentForm] = useState({ title: '', body: '', image: '', extra: '', extra2: '' });
  const handleContentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0], 'contents');
      setContentForm({ ...contentForm, image: url });
    }
  };

  const submitClinic = async (e: React.FormEvent) => {
    e.preventDefault(); if (!authState.user || !contentForm.image) return alert("Pilih foto!");
    try { await addDoc(collection(db, "clinics"), { namaKlinik: contentForm.title, alamat: contentForm.body, whatsapp: contentForm.extra, imageUrl: contentForm.image, authorId: authState.user.id, authorName: authState.user.name });
      alert("Klinik terdaftar!"); setContentForm({ title: '', body: '', image: '', extra: '', extra2: '' });
    } catch (e) { alert("Gagal."); }
  };

  const submitTraining = async (e: React.FormEvent) => {
    e.preventDefault(); if (!authState.user || !contentForm.image) return alert("Pilih foto!");
    try { await addDoc(collection(db, "trainings"), { title: contentForm.title, date: contentForm.extra, jam: contentForm.extra2, whatsapp: contentForm.body, tempat: 'GMRJ Center / Lokasi Penyelenggara', imageUrl: contentForm.image, instructorId: authState.user.id, instructorName: authState.user.name });
      alert("Jadwal dibuat!"); setContentForm({ title: '', body: '', image: '', extra: '', extra2: '' });
    } catch (e) { alert("Gagal."); }
  };

  const canManageClinic = authState.user && [MemberLevel.ADVANCE, MemberLevel.PROFESIONAL, MemberLevel.MASTER, MemberLevel.INSTRUKTUR].includes(authState.user.level);
  const canManageTraining = authState.user && authState.user.level === MemberLevel.INSTRUKTUR;
  const canManageCerts = authState.user && authState.user.level !== MemberLevel.MAGANG;

  const userAnnouncements = useMemo(() => {
    if (!authState.user) return generalAnnouncements;
    return [...privateAnnouncements, ...generalAnnouncements].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [generalAnnouncements, privateAnnouncements, authState.user]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-gold px-4 md:px-8 py-2 md:py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('home')}>
          <div className="scale-75 md:scale-100 shrink-0">{GOLD_LOGO}</div>
          <h1 className="text-xs md:text-2xl font-luxury font-bold text-gold tracking-tight group-hover:brightness-125 transition-all uppercase whitespace-nowrap">MEMBER GMRJ</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => {
              if (authState.isAuthenticated) {
                setView('dasbor');
                setDasborTab('pengumuman');
              } else {
                setView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="relative p-2 text-gold hover:scale-110 transition-transform focus:outline-none"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22a2 2 0 01-2-2h4a2 2 0 01-2 2zm6-6H6v-5a6 6 0 0112 0v5zm1.53-3.64l1.41-1.41-1.41-1.41-1.41 1.41 1.41 1.41zM12 2a1 1 0 011 1v.07A7.001 7.001 0 0119 10v5h2v2H3v-2h2v-5a7.001 7.001 0 016-6.93V3a1 1 0 011-1z" />
            </svg>
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 border border-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
            )}
          </button>

          {authState.isAuthenticated ? (
            <div className="flex items-center gap-2 md:gap-3">
               <button onClick={() => setView('dasbor')} className="text-[10px] md:text-xs bg-slate-800 hover:bg-slate-700 px-2 md:px-3 py-1.5 rounded-lg border border-gold/30 text-gold font-bold uppercase">Dasbor</button>
               {authState.user?.role === 'admin' && <button onClick={() => setView('admin')} className="text-[10px] md:text-xs bg-gold/10 hover:bg-gold/20 px-2 md:px-3 py-1.5 rounded-lg border border-gold/50 text-gold font-bold uppercase">Admin</button>}
               <button onClick={() => signOut(auth)} className="text-[10px] md:text-xs text-slate-400 font-bold uppercase underline">Keluar</button>
            </div>
          ) : (
            <div className="flex gap-1 md:gap-2">
              <button onClick={() => setShowLogin(true)} className="px-2 md:px-4 py-2 text-[10px] md:text-sm text-gold hover:text-white transition-colors uppercase font-bold tracking-wider">Masuk</button>
              <button onClick={() => { setShowRegister(true); setRegSuccess(false); }} className="gold-button px-3 md:px-5 py-2 text-[10px] md:text-sm rounded-lg font-bold uppercase tracking-wider">Daftar</button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 animate-in fade-in duration-500">
            {generalAnnouncements.length > 0 && (
              <div className="mb-10 bg-gold/5 border border-gold/30 rounded-3xl p-6 md:p-8 animate-in slide-in-from-top duration-700 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">📢</span>
                  <h3 className="text-gold font-luxury font-bold uppercase text-xs md:text-sm tracking-widest">Pengumuman GMRJ Center</h3>
                </div>
                <div className="space-y-4">
                  {generalAnnouncements.slice(0, 1).map(a => (
                    <div key={a.id} className="text-slate-200 text-xs md:text-base leading-relaxed italic">
                      "{a.message}"
                      <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-widest">Terbit: {new Date(a.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-3xl md:text-6xl font-luxury mb-2 text-white uppercase tracking-tighter">Gusmus Raksa Jasad</h2>
              <p className="font-luxury text-sm md:text-2xl italic text-gold tracking-widest opacity-90 uppercase">Momentum Balung Wesi</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-1.5 mb-8 md:mb-12 bg-slate-900/60 p-1.5 rounded-xl md:rounded-full w-fit mx-auto border border-slate-800 shadow-xl">
               {['anggota', 'klinik', 'pelatihan'].map(t => (
                 <button key={t} onClick={() => setHomeTab(t as any)} className={`px-3 md:px-8 py-2 md:py-3 rounded-lg md:rounded-full text-[9px] md:text-[10px] font-bold transition-all uppercase tracking-widest ${homeTab === t ? 'bg-gold-gradient text-slate-950 shadow-lg' : 'text-slate-400 hover:text-gold hover:bg-white/5'}`}>{t}</button>
               ))}
            </div>

            <div className="space-y-6 md:space-y-8">
              {homeTab === 'anggota' && (
                <>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                      <div className="flex-grow relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gold/50 group-focus-within:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          value={searchTerm} 
                          onChange={e => setSearchTerm(e.target.value)} 
                          placeholder="Cari Nama, No KTA, atau Kota..." 
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white outline-none focus:border-gold transition-all shadow-inner" 
                        />
                      </div>
                      <div className="md:w-64">
                        <select 
                          value={searchLevel} 
                          onChange={e => setSearchLevel(e.target.value as any)} 
                          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-gold font-bold outline-none focus:border-gold transition-all"
                        >
                          <option value="">Semua Level</option>
                          {Object.values(MemberLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredMembers.map(member => <MemberCard key={member.id} member={member} onViewProfile={setSelectedMember} />)}
                  </div>
                  {filteredMembers.length === 0 && <div className="text-center py-20 text-slate-500 uppercase text-[10px] tracking-widest bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">Tidak ada praktisi yang ditemukan dengan kriteria tersebut.</div>}
                </>
              )}

              {homeTab === 'klinik' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {clinics.map(c => (
                    <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-gold transition-all group">
                      <img src={c.imageUrl} className="w-full h-48 object-cover group-hover:scale-105 transition-all" />
                      <div className="p-5">
                        <h4 className="text-gold font-luxury font-bold text-lg mb-1 uppercase">{c.namaKlinik}</h4>
                        <p className="text-xs text-slate-400 mb-4">{c.alamat}</p>
                        <a href={`https://wa.me/${c.whatsapp}`} target="_blank" className="inline-block bg-slate-800 hover:bg-gold text-slate-300 hover:text-slate-950 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all">Hubungi</a>
                      </div>
                    </div>
                  ))}
                  {clinics.length === 0 && <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-2xl border border-slate-800"><p className="text-slate-500 italic uppercase text-[10px] tracking-widest">Daftar Klinik hanya muncul untuk Member aktif.</p></div>}
                </div>
              )}

              {homeTab === 'pelatihan' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {trainings.map(t => (
                    <div key={t.id} className="bg-slate-900/60 border border-gold/20 rounded-2xl overflow-hidden flex flex-col group hover:border-gold transition-all">
                      <div className="aspect-[2/3] w-full overflow-hidden">
                        <img src={t.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="Poster Pelatihan" />
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-luxury font-bold text-white mb-2 uppercase tracking-tighter">{t.title}</h4>
                        <p className="text-xs text-slate-400 mb-1 font-bold">📅 {t.date} | ⏰ {t.jam}</p>
                        <p className="text-[10px] text-gold uppercase font-black mb-4">Instruktur: {t.instructorName}</p>
                        <a href={`https://wa.me/${t.whatsapp}`} target="_blank" className="block text-center gold-button py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg">Daftar Pelatihan</a>
                      </div>
                    </div>
                  ))}
                  {trainings.length === 0 && <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-2xl border border-slate-800"><p className="text-slate-500 italic uppercase text-[10px] tracking-widest">Jadwal Pelatihan hanya muncul untuk Member aktif.</p></div>}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'admin' && authState.user?.role === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-luxury text-gold mb-8 uppercase tracking-widest border-b border-gold/20 pb-4">Panel Manajemen Admin GMRJ</h2>
            
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
               {['anggota', 'pengumuman'].map(tab => (
                 <button key={tab} onClick={() => setAdminSubTab(tab as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${adminSubTab === tab ? 'bg-gold-gradient text-slate-950 shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-gold'}`}>{tab}</button>
               ))}
            </div>

            {adminSubTab === 'anggota' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-[10px] md:text-xs min-w-[800px]">
                  <thead className="bg-slate-800 text-gold uppercase font-bold">
                    <tr><th className="p-4">Member</th><th className="p-4">Username (Email)</th><th className="p-4">KTA</th><th className="p-4">Level</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3"><img src={u.photoUrl} className="w-8 h-8 rounded-full border border-gold/30" />{u.name}</td>
                        <td className="p-4 text-slate-400">{u.email}</td>
                        <td className="p-4 font-mono">{u.ktaNumber}</td>
                        <td className="p-4 font-black uppercase text-gold">{u.level}</td>
                        <td className="p-4">
                          {!u.isApproved ? (
                            <button onClick={() => approveUser(u.id)} className="bg-gold text-slate-950 px-3 py-1 rounded text-[9px] font-black uppercase">Approve</button>
                          ) : (
                            <div className="flex gap-2">
                               <button onClick={() => toggleUserStatus(u.id, u.isActive)} className={`px-2 py-1 rounded text-[9px] uppercase font-bold ${u.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>{u.isActive ? 'Aktif' : 'Nonaktif'}</button>
                               <button onClick={() => togglePremium(u.id, u.hasPremiumAccess)} className={`px-2 py-1 rounded text-[9px] uppercase font-bold ${u.hasPremiumAccess ? 'bg-gold/20 text-gold' : 'bg-slate-700 text-slate-400'}`}>Premium</button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                           <div className="flex gap-3">
                              <button onClick={() => setEditingUser(u)} className="text-blue-400 hover:underline font-bold uppercase text-[9px]">⚙️ Pengaturan</button>
                              <button onClick={() => { if(confirm("Hapus member?")) deleteDoc(doc(db, "users", u.id)) }} className="text-red-500 hover:underline font-bold uppercase text-[9px]">Hapus</button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminSubTab === 'pengumuman' && (
               <div className="max-w-2xl mx-auto space-y-8">
                  <div className="bg-slate-900 border border-gold/20 p-8 rounded-3xl shadow-xl">
                     <h3 className="text-gold font-bold uppercase text-xs mb-6 tracking-widest">Buat Pengumuman Baru</h3>
                     <form onSubmit={handlePostAnnouncement} className="space-y-4">
                        <textarea value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} placeholder="Tulis pesan pengumuman..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm h-32 outline-none focus:border-gold" />
                        <div className="flex items-center gap-4">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Penerima:</label>
                           <select value={announcementTarget} onChange={e => setAnnouncementTarget(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs outline-none text-gold font-bold">
                              <option value="all">📢 Semua Member (Umum)</option>
                              {users.map(u => <option key={u.id} value={u.id}>👤 {u.name} ({u.ktaNumber})</option>)}
                           </select>
                        </div>
                        <button type="submit" className="w-full gold-button py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Terbitkan Pengumuman</button>
                     </form>
                  </div>
                  <div className="space-y-4">
                     {announcements.map(a => (
                        <div key={a.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-start hover:border-gold/30 transition-all">
                           <div>
                              <p className="text-sm text-white mb-2 leading-relaxed">{a.message}</p>
                              <div className="flex gap-4">
                                 <span className="text-[9px] font-black uppercase text-gold tracking-widest">{a.targetMemberId ? `🔒 Privat` : `📢 Umum`}</span>
                                 <span className="text-[9px] font-bold text-slate-500">{new Date(a.createdAt).toLocaleString('id-ID')}</span>
                              </div>
                           </div>
                           <button onClick={async () => { if(confirm("Hapus?")) await deleteDoc(doc(db, "announcements", a.id)) }} className="text-red-500 text-xs p-1 hover:bg-red-500/10 rounded">✕</button>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        )}

        {view === 'dasbor' && authState.isAuthenticated && authState.user && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
            <aside className="w-full md:w-80 space-y-6">
              <div className="bg-slate-900 border border-gold/30 rounded-3xl p-8 text-center shadow-2xl relative">
                <div className="relative group mx-auto w-28 h-28 mb-4">
                  <img src={authState.user.photoUrl} className="w-full h-full rounded-full object-cover border-2 border-gold shadow-lg" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-[9px] font-black uppercase text-gold">Ubah Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const url = await uploadFile(e.target.files[0], 'profiles');
                        setAuthState({...authState, user: {...authState.user!, photoUrl: url}});
                        await updateDoc(doc(db, "users", authState.user!.id), { photoUrl: url });
                      }
                    }} />
                  </label>
                </div>
                {uploading && <div className="text-[10px] text-gold animate-pulse mb-2">Mengunggah...</div>}
                <h3 className="text-xl font-luxury text-white uppercase font-bold tracking-tight">{authState.user.name}</h3>
                <p className="text-gold font-mono text-sm mt-1 mb-4">{authState.user.ktaNumber}</p>
                
                <div className="inline-block bg-gold-gradient px-6 py-2 rounded-lg shadow-xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                  <span className="text-slate-950 text-[11px] font-black uppercase tracking-[0.15em] drop-shadow-sm">
                    {authState.user.level}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl overflow-hidden">
                <nav className="flex flex-col gap-2">
                  {['profil', 'sertifikat', 'konten', 'premium', 'pengumuman'].map(tab => {
                    const hasPrivateAnn = tab === 'pengumuman' && privateAnnouncements.length > 0;
                    return (
                      <button 
                        key={tab} 
                        onClick={() => setDasborTab(tab as any)} 
                        className={`px-6 py-4 rounded-2xl text-[11px] font-black uppercase transition-all duration-300 text-left flex items-center gap-4 relative ${
                          dasborTab === tab 
                          ? 'bg-gold-gradient text-slate-950 shadow-[0_4px_15px_rgba(212,175,55,0.4)] border border-white/20' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-gold'
                        }`}
                      >
                        <span className="text-lg">
                          {tab === 'profil' ? '👤' : tab === 'sertifikat' ? '📜' : tab === 'konten' ? '📝' : tab === 'premium' ? '⭐' : '📢'}
                        </span>
                        {tab}
                        {hasPrivateAnn && (
                          <span className="ml-auto w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                        )}
                        {tab === 'pengumuman' && userAnnouncements.length > 0 && (
                          <span className="ml-auto bg-slate-800 text-gold text-[8px] px-1.5 py-0.5 rounded-full border border-gold/30">
                            {userAnnouncements.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>

            <div className="flex-grow">
              {dasborTab === 'profil' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-10 shadow-2xl">
                  <h3 className="text-xl md:text-2xl font-luxury text-gold mb-4 md:mb-8 uppercase font-bold">Profil Praktisi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
                    <div className="bg-slate-800/30 p-4 md:p-6 rounded-2xl border border-slate-700">
                      <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Terdaftar Sejak</p>
                      <p className="text-xs md:text-sm font-bold text-white">{new Date(authState.user.joinedAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className={`p-4 md:p-6 rounded-2xl border ${new Date(authState.user.expiresAt) < new Date(new Date().setDate(new Date().getDate() + 30)) ? 'bg-red-900/10 border-red-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
                      <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">Masa Berlaku KTA</p>
                      <p className="text-xs md:text-sm font-bold text-white">{new Date(authState.user.expiresAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] md:text-[10px] font-bold text-gold uppercase tracking-widest">Nama</label>
                        <input value={authState.user.name} onChange={e => setAuthState({...authState, user: {...authState.user!, name: e.target.value}})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-white outline-none focus:border-gold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] md:text-[10px] font-bold text-gold uppercase tracking-widest">Kota</label>
                        <input value={authState.user.city} onChange={e => setAuthState({...authState, user: {...authState.user!, city: e.target.value}})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-white outline-none focus:border-gold" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] md:text-[10px] font-bold text-gold uppercase tracking-widest">WhatsApp</label>
                      <input value={authState.user.whatsapp} onChange={e => setAuthState({...authState, user: {...authState.user!, whatsapp: e.target.value}})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-white outline-none focus:border-gold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] md:text-[10px] font-bold text-gold uppercase tracking-widest">Biografi</label>
                      <textarea value={authState.user.bio} onChange={e => setAuthState({...authState, user: {...authState.user!, bio: e.target.value}})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm h-24 md:h-32 text-white outline-none focus:border-gold" />
                    </div>
                    <button type="submit" className="gold-button w-full md:w-auto px-10 py-3.5 md:py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl">Simpan Perubahan</button>
                  </form>
                </div>
              )}

              {dasborTab === 'pengumuman' && (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <h3 className="text-2xl font-luxury text-gold mb-8 uppercase font-bold tracking-widest">Pengumuman Organisasi</h3>
                    {userAnnouncements.length > 0 ? userAnnouncements.map(a => (
                       <div key={a.id} className={`p-8 rounded-3xl border ${a.targetMemberId ? 'bg-gold/5 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'bg-slate-900 border-slate-800'}`}>
                          <div className="flex items-center gap-3 mb-4">
                             <span className="text-2xl">{a.targetMemberId ? '👤' : '📢'}</span>
                             <p className="text-[10px] font-black uppercase text-gold tracking-widest">{a.targetMemberId ? 'Pesan Privat Untuk Anda' : 'Pengumuman Umum'}</p>
                          </div>
                          <p className="text-slate-200 leading-relaxed text-sm md:text-base italic">"{a.message}"</p>
                          <p className="text-[8px] text-slate-500 mt-6 uppercase font-bold tracking-widest">{new Date(a.createdAt).toLocaleString('id-ID')}</p>
                       </div>
                    )) : (
                       <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800">
                          <p className="text-slate-500 italic text-sm uppercase tracking-widest">Belum ada informasi terbaru.</p>
                       </div>
                    )}
                 </div>
              )}

              {dasborTab === 'sertifikat' && canManageCerts && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                     <h3 className="text-xl font-luxury text-gold mb-6 uppercase font-bold tracking-widest">Tambah Sertifikat Baru</h3>
                     <form onSubmit={handleAddCertificate} className="space-y-4">
                        <input required value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} placeholder="Judul Sertifikat" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold" />
                        <div className="flex items-center gap-4">
                          <label className="flex-grow cursor-pointer bg-slate-800 border border-dashed border-gold/50 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-gold/5 transition-all">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Pilih Foto Sertifikat</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleCertFileChange} />
                            {certForm.imageUrl && <span className="text-[8px] text-green-500 mt-1 truncate max-w-xs">✓ Foto Terpilih</span>}
                          </label>
                          {certForm.imageUrl && <img src={certForm.imageUrl} className="w-20 h-20 rounded-lg object-cover border border-gold shadow-lg" />}
                        </div>
                        <button type="submit" className={`w-full gold-button py-3 rounded-xl font-black uppercase text-[10px] tracking-widest ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>Unggah Sertifikat</button>
                     </form>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {authState.user.certificates.map(cert => (
                      <div key={cert.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-4 items-center group hover:border-gold transition-colors shadow-lg">
                        <img src={cert.imageUrl} className="w-16 h-16 rounded-lg object-cover border border-slate-700 group-hover:border-gold/50" />
                        <div className="flex-grow"><h4 className="text-sm font-bold text-white uppercase tracking-tight">{cert.title}</h4></div>
                        <button onClick={() => removeCertificate(cert.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors focus:outline-none">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dasborTab === 'konten' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex gap-2 bg-slate-900 p-1 rounded-full w-fit border border-slate-800 shadow-xl">
                    {['klinik', 'pelatihan'].map(tab => (
                      ((tab === 'klinik' && canManageClinic) || (tab === 'pelatihan' && canManageTraining)) && (
                        <button key={tab} onClick={() => setActiveContentTab(tab as any)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all tracking-widest ${activeContentTab === tab ? 'bg-gold text-slate-950 shadow-lg' : 'text-slate-500 hover:text-gold'}`}>{tab}</button>
                      )
                    ))}
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
                    {activeContentTab === 'klinik' ? (
                      <form onSubmit={submitClinic} className="space-y-6">
                        <h4 className="text-gold font-bold uppercase text-xs mb-4 tracking-widest">Registrasi Klinik GMRJ</h4>
                        <input required value={contentForm.title} onChange={e => setContentForm({...contentForm, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm" placeholder="Nama Klinik" />
                        <div className="flex items-center gap-4">
                          <label className="flex-grow cursor-pointer bg-slate-800 border border-dashed border-gold/50 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gold/5 transition-all">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Foto Lokasi Klinik</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleContentFileChange} />
                          </label>
                          {contentForm.image && <img src={contentForm.image} className="w-24 h-24 rounded-2xl object-cover border border-gold shadow-lg" />}
                        </div>
                        <textarea required value={contentForm.body} onChange={e => setContentForm({...contentForm, body: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm h-32" placeholder="Alamat Klinik Lengkap" />
                        <input required value={contentForm.extra} onChange={e => setContentForm({...contentForm, extra: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm" placeholder="Nomor WhatsApp (Contoh: 628xxx)" />
                        <button type="submit" className={`gold-button px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl ${uploading ? 'opacity-50' : ''}`}>Simpan Data Klinik</button>
                      </form>
                    ) : (
                      <form onSubmit={submitTraining} className="space-y-6">
                        <h4 className="text-gold font-bold uppercase text-xs mb-4 tracking-widest">Penerbitan Jadwal Pelatihan</h4>
                        <input required value={contentForm.title} onChange={e => setContentForm({...contentForm, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm" placeholder="Judul Pelatihan" />
                        <div className="flex items-center gap-4">
                          <label className="flex-grow cursor-pointer bg-slate-800 border border-dashed border-gold/50 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gold/5 transition-all">
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Upload Poster Pelatihan</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleContentFileChange} />
                          </label>
                          {contentForm.image && <img src={contentForm.image} className="w-20 h-28 rounded-lg object-cover border border-gold shadow-lg" />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input required type="date" value={contentForm.extra} onChange={e => setContentForm({...contentForm, extra: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm" />
                          <input required value={contentForm.extra2} onChange={e => setContentForm({...contentForm, extra2: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm" placeholder="Jam Operasional" />
                        </div>
                        <input required value={contentForm.body} onChange={e => setContentForm({...contentForm, body: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm" placeholder="WA Pendaftaran (628xxx)" />
                        <button type="submit" className={`gold-button px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl ${uploading ? 'opacity-50' : ''}`}>Terbitkan Jadwal</button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {dasborTab === 'premium' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button onClick={() => setPremiumAppId(1)} className={`p-8 rounded-3xl border-2 transition-all group ${premiumAppId === 1 ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-slate-800 bg-slate-900 hover:border-gold/30'}`}><div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔮</div><div className="text-xs font-black uppercase text-gold tracking-widest">Balung Wesi</div></button>
                    <button onClick={() => setPremiumAppId(2)} className={`p-8 rounded-3xl border-2 transition-all group ${premiumAppId === 2 ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-slate-800 bg-slate-900 hover:border-gold/30'}`}><div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧬</div><div className="text-xs font-black uppercase text-gold tracking-widest">FisioDetect</div></button>
                  </div>
                  {premiumAppId && (authState.user.hasPremiumAccess || authState.user.role === 'admin' ? <PremiumApp appId={premiumAppId} /> : <div className="bg-slate-900 border border-gold/20 p-16 rounded-3xl text-center shadow-xl"><h4 className="text-2xl text-gold font-luxury mb-4 uppercase tracking-widest">Akses Terbatas</h4><p className="text-xs text-slate-500 uppercase tracking-widest">Hubungi Admin GMRJ untuk Lisensi Premium.</p></div>)}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedMember && <ProfileModal member={selectedMember} isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} />}
      
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-slate-900 border border-gold rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-luxury text-gold uppercase font-bold tracking-widest">Pengaturan Akun Member</h3>
                 <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white p-2 focus:outline-none">✕</button>
              </div>
              <form onSubmit={handleAdminUpdateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1"><label className="text-[9px] font-bold text-gold uppercase tracking-widest">Nama Member</label><input value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-gold" /></div>
                 <div className="space-y-1"><label className="text-[9px] font-bold text-gold uppercase tracking-widest">Username / Email</label><input value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-gold" /></div>
                 <div className="space-y-1"><label className="text-[9px] font-bold text-gold uppercase tracking-widest">KTA Number</label><input value={editingUser.ktaNumber} onChange={e => setEditingUser({...editingUser, ktaNumber: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-gold" /></div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gold uppercase tracking-widest">Level Member</label>
                    <select value={editingUser.level} onChange={e => setEditingUser({...editingUser, level: e.target.value as any})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs outline-none text-gold font-bold">
                       {Object.values(MemberLevel).map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1"><label className="text-[9px] font-bold text-gold uppercase tracking-widest">Tgl Kedaluwarsa</label><input type="date" value={editingUser.expiresAt.split('T')[0]} onChange={e => setEditingUser({...editingUser, expiresAt: new Date(e.target.value).toISOString()})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-gold" /></div>
                 <div className="space-y-1"><label className="text-[9px] font-bold text-gold uppercase tracking-widest">WA Member</label><input value={editingUser.whatsapp} onChange={e => setEditingUser({...editingUser, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-gold" /></div>
                 <button type="submit" className="md:col-span-2 gold-button py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] mt-4 shadow-xl">Simpan Perubahan Akun</button>
              </form>
           </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-slate-900 border border-gold rounded-3xl p-6 md:p-8 w-full max-w-[340px] text-center animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 focus:outline-none">✕</button>
            <div className="mb-6 scale-90">{GOLD_LOGO}</div>
            <h3 className="text-xl font-luxury text-white mb-2 uppercase font-bold tracking-widest">LOGIN MEMBER</h3>
            <form onSubmit={handleLogin} className="space-y-4 text-left mt-6">
              <input required value={ktaInput} onChange={e => setKtaInput(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold" placeholder="Nomor KTA" />
              <input required type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold" placeholder="Password" />
              <button type="submit" className="w-full gold-button py-4 rounded-xl font-black mt-4 uppercase text-[10px] tracking-[0.15em] shadow-xl active:scale-95 transition-all">Masuk Sekarang</button>
            </form>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-slate-900 border border-gold rounded-3xl p-10 w-full max-w-xl animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <button onClick={() => { setShowRegister(false); setRegSuccess(false); }} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 focus:outline-none">✕</button>
            {regSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="text-gold text-5xl mb-4 animate-bounce">✓</div>
                <h3 className="text-2xl font-luxury text-white uppercase font-bold tracking-widest">Pendaftaran Berhasil</h3>
                <p className="text-gold font-bold text-sm uppercase tracking-wider">Akses sedang diverifikasi oleh Dewan Admin GMRJ</p>
                <button 
                  onClick={() => { setShowRegister(false); setRegSuccess(false); }} 
                  className="mt-8 gold-button px-12 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                >
                  Dimengerti
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-luxury text-gold uppercase text-center mb-8 font-bold tracking-widest">PENDAFTARAN MEMBER</h3>
                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-gold" placeholder="Nama Lengkap" />
                  <input required type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-gold" placeholder="Email Aktif" />
                  <input required value={regData.kta} onChange={e => setRegData({...regData, kta: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-gold" placeholder="Nomor KTA" />
                  <input required type="password" value={regData.pass} onChange={e => setRegData({...regData, pass: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-gold" placeholder="Password Baru" />
                  <button type="submit" className="md:col-span-2 gold-button py-5 rounded-xl font-black uppercase text-xs tracking-[0.15em] shadow-xl active:scale-95 transition-all">Ajukan Permohonan Keanggotaan</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="py-16 border-t border-slate-900 bg-slate-950 text-center opacity-50 mt-auto">
        <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase font-black">© 2026 PT Manajemen Gusmus Raksa Jasad</p>
      </footer>
    </div>
  );
};

export default App;
