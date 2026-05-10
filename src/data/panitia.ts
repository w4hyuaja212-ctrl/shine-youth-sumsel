// Daftar akun panitia yang otomatis di-seed ke sistem.
// Default password: smamsa2026 (silakan diubah setelah login pertama).
export type PanitiaSeed = {
  username: string;
  role: "panitia_superadmin" | "panitia_pj" | "panitia_viewer";
  label: string;
  akses: string | null; // nama lomba (cocokkan dengan LOMBA[].name); null = semua
};

export const DEFAULT_PANITIA_PASSWORD = "smamsa2026";

export const PANITIA_SEED: PanitiaSeed[] = [
  { username: "ZerodateX70", role: "panitia_superadmin", label: "Panitia Pusat", akses: null },

  { username: "pj_badminton", role: "panitia_pj", label: "Koordinator Badminton", akses: "Bulu Tangkis" },
  { username: "pj_futsal",    role: "panitia_pj", label: "Koordinator Futsal",    akses: "Futsal" },
  { username: "pj_ml",        role: "panitia_pj", label: "Koordinator MLBB",      akses: "Mobile Legends" },
  { username: "pj_ltbb",      role: "panitia_pj", label: "Koordinator LTBB",      akses: "LTBB" },
  { username: "pj_ssc",       role: "panitia_pj", label: "Koordinator SSC",       akses: "Super Smart Competition" },
  { username: "pj_vocal",     role: "panitia_pj", label: "Koordinator Vocal",     akses: "Vocal Solo" },
  { username: "pj_pion",      role: "panitia_pj", label: "Koordinator Pionering", akses: "Pionering" },
  { username: "pj_tahfiz",    role: "panitia_pj", label: "Koordinator Tahfidz",   akses: "Tahfidz Qur'an" },
  { username: "pj_tilawah",   role: "panitia_pj", label: "Koordinator Tilawah",   akses: "Musabaqoh Tilawatil Quran" },
  { username: "pj_pidato",    role: "panitia_pj", label: "Koordinator Pidato",    akses: "Pidato Bahasa Inggris" },

  { username: "viewer_badminton", role: "panitia_viewer", label: "Viewer Bulu Tangkis", akses: "Bulu Tangkis" },
  { username: "viewer_futsal",    role: "panitia_viewer", label: "Viewer Futsal",       akses: "Futsal" },
  { username: "viewer_ml",        role: "panitia_viewer", label: "Viewer MLBB",         akses: "Mobile Legends" },
  { username: "viewer_ltbb",      role: "panitia_viewer", label: "Viewer LTBB",         akses: "LTBB" },
  { username: "viewer_ssc",       role: "panitia_viewer", label: "Viewer SSC",          akses: "Super Smart Competition" },
  { username: "viewer_vocal",     role: "panitia_viewer", label: "Viewer Vocal",        akses: "Vocal Solo" },
  { username: "viewer_pionering", role: "panitia_viewer", label: "Viewer Pionering",    akses: "Pionering" },
  { username: "viewer_tahfiz",    role: "panitia_viewer", label: "Viewer Tahfidz",      akses: "Tahfidz Qur'an" },
  { username: "viewer_tilawah",   role: "panitia_viewer", label: "Viewer Tilawah",      akses: "Musabaqoh Tilawatil Quran" },
  { username: "viewer_pidato",    role: "panitia_viewer", label: "Viewer Pidato",       akses: "Pidato Bahasa Inggris" },
];
