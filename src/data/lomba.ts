export type Lomba = {
  slug: string;
  category: string;
  name: string;
  desc: string;
  rules: string[];
  icon: string;
};

export const LOMBA: Lomba[] = [
  {
    slug: "futsal",
    category: "Olahraga",
    name: "Futsal",
    desc: "Turnamen futsal bergengsi di Gedung B. Kuota: 32 Tim Putra & 16 Tim Putri.",
    rules: [
      "Kategori Putra (Max 32 Tim) & Putri (Max 16 Tim)",
      "Setiap sekolah MAKSIMAL 1 TIM per kategori",
    ],
    icon: "⚽",
  },
  {
    slug: "mobile-legends",
    category: "E-Sport",
    name: "Mobile Legends",
    desc: "Turnamen MLBB Offline di Gedung A. Buktikan tim sekolahmu yang terkuat.",
    rules: ["Setiap sekolah MAKSIMAL 1 TIM", "Hadiah sampai Juara 4"],
    icon: "🎮",
  },
  {
    slug: "bulu-tangkis",
    category: "Olahraga",
    name: "Bulu Tangkis",
    desc: "Kompetisi tunggal di Gedung B. Kuota Ketat: 16 Putra & 16 Putri.",
    rules: [
      "Tunggal Putra (Max 16) & Tunggal Putri (Max 16)",
      "Setiap sekolah MAKSIMAL 1 PESERTA per kategori",
    ],
    icon: "🏸",
  },
  {
    slug: "ltbb",
    category: "Kepanduan",
    name: "LTBB",
    desc: "Lomba membuat Menara Pantau Dauble Piramid di Gedung A tingkat penggalang.",
    rules: ["Kategori Putra & Putri", "Maksimal 1 regu Putra dan 1 regu Putri per sekolah"],
    icon: "🗼",
  },
  {
    slug: "pionering",
    category: "Kepanduan",
    name: "Pionering",
    desc: "Lomba ketangkasan Pionering 27 gerakan (boleh ada yel-yel) di Gedung A.",
    rules: ["Kategori Putra & Putri", "Maksimal 1 regu Putra dan 1 regu Putri per sekolah"],
    icon: "🪢",
  },
  {
    slug: "tahfidz",
    category: "Keagamaan",
    name: "Tahfidz Qur'an",
    desc: "Hafalan Juz 30 di Gedung A. Penilaian: Tajwid, Makhraj, Kefashihan, Adab.",
    rules: ["Individu (Kuota Sekolah Bebas)", "Khusus Juz 30 (SMP/MTs/Pesantren)"],
    icon: "📖",
  },
  {
    slug: "mtq",
    category: "Keagamaan",
    name: "Musabaqoh Tilawatil Quran",
    desc: "Lomba membaca Al-Quran dengan bacaan mujawwad di Gedung A.",
    rules: ["Individu (Kuota Sekolah Bebas)", "Durasi 5–7 menit"],
    icon: "🕌",
  },
  {
    slug: "ssc",
    category: "Akademik",
    name: "Super Smart Competition",
    desc: "LCC: Matematika, IPA, dan Pengetahuan Umum di Gedung A.",
    rules: ["Maksimal 2 tim per sekolah", "Satu tim 3 orang"],
    icon: "🧠",
  },
  {
    slug: "vocal-solo",
    category: "Seni",
    name: "Vocal Solo",
    desc: "Tunjukkan kemampuan vokal terbaikmu di Gedung A.",
    rules: [
      "Maksimal 2 Peserta per Sekolah",
      "Lagu Wajib (Pilih 1): Tanah Air, Indonesia Pusaka, Syukur, Ibu Pertiwi, Rayuan Pulau Kelapa",
    ],
    icon: "🎤",
  },
  {
    slug: "pidato-inggris",
    category: "Bahasa",
    name: "Pidato Bahasa Inggris",
    desc: "Tema: Teenagers and Creative Healthy Lifestyles / Modern Technology / Facing Global Culture.",
    rules: [
      "Individu (Kuota Sekolah Bebas)",
      "Durasi 5–7 menit, tanpa teks (catatan poin diperbolehkan)",
    ],
    icon: "🎙️",
  },
];

export const SCHEDULE = [
  { date: "01 Mar 2026", title: "Pendaftaran Dibuka", desc: "Login NPSN & pilih cabang lomba." },
  { date: "30 Apr 2026", title: "Pendaftaran Ditutup", desc: "Pastikan semua berkas terupload." },
  { date: "11 Mei 2026", title: "Technical Meeting", desc: "Pkl 13.00 WIB — koordinasi teknis." },
  { date: "13–15 Mei 2026", title: "Pelaksanaan Lomba", desc: "Gedung A & Gedung B SMAMSA." },
  { date: "16 Mei 2026", title: "Grand Final & Penutupan", desc: "Pengumuman juara & pembagian hadiah." },
];
