## 1. Login Sekolah — NPSN saja
- Hapus halaman `/signup` & semua link "Daftar".
- `/login` (sekolah): hanya 1 input **NPSN (8 digit)** + tombol "Masuk".
- Server function `loginByNPSN`:
  1. Cek format 8 digit.
  2. Panggil `https://api.fazriansyah.eu.org/v1/sekolah?npsn=...` (sisi server, agar tidak terblokir CORS).
  3. Jika valid → cari/buat akun Auth (`npsn-XXXX@smamsa.local`), set password sementara acak via service-role.
  4. Upsert `profiles` (nama, alamat, jenjang dari Dapodik) + role `school`.
  5. Kembalikan `{ email, tempPassword }` ke browser → langsung `signInWithPassword`.
- Login Panitia tetap pakai username + password lama (tab terpisah pada `/login`).
- PIC & No. WA sekolah dilengkapi sekali saat **profil** (bukan saat login).

## 2. Sisi Admin — Menu Baru
Hanya muncul jika `isPanitia`. Superadmin lihat semua, PJ/Viewer tetap dibatasi cabang aksesnya.

| Menu | Fungsi |
|---|---|
| **NPSN Tools** | Form pencari NPSN (panggil API publik), daftar tautan langsung ke endpoint API (`/sekolah?npsn=`, `/sekolah/wilayah?...`, dsb.), dengan tombol "buka di tab baru" + "salin URL". |
| **Statistik** | Kartu angka real dari DB: total sekolah, total tim, per cabang, per status, per jenjang; chart bar (recharts) per cabang. |
| **Cetak Sertifikat** | Pilih cabang + tim verified → generate PDF sertifikat per anggota (template SOF SMAMSA). |
| **Cetak ID Card** | Pilih cabang + tim verified → generate PDF ID card 4-up per halaman (foto opsional, nama, sekolah, peran, QR). |
| **Galeri Kegiatan** | Upload multi foto (bucket `galeri` publik), kelola caption, hapus. |
| **Bracket & Poin** | Tab per cabang. Futsal/Badminton/Mobile Legend → editor bracket single-elimination (drag entry tim ke slot, isi skor). Lainnya → tabel poin (nama tim, poin, ranking auto). Disimpan sebagai JSONB. |

## 3. Halaman Publik Baru
- `/galeri` — grid foto dari bucket galeri.
- `/bagan/$slug` — tampilan bracket atau tabel poin (read-only) yang dipublikasi panitia.

## 4. Database (migration)
Tabel/bucket baru (RLS sesuai):
- `gallery_photos(id, file_path, caption, uploaded_by, created_at)` — public SELECT, panitia ALL.
- `lomba_brackets(lomba_slug PK, data jsonb, published bool, updated_at)` — public SELECT bila published, panitia modify sesuai akses.
- `lomba_points(lomba_slug PK, data jsonb, published bool, updated_at)` — sama.
- Bucket `galeri` (public) + RLS.
- Edge case: izinkan trigger `handle_new_user` tetap bekerja dengan metadata kosong (sudah aman).

## 5. Teknis PDF
- Pakai `pdf-lib` (sudah edge-compatible) di server function → stream PDF ke browser.
- Sertifikat: ukuran A4 landscape, nama besar, kop SOF SMAMSA, cabang, tanggal. Background gradient + border emas.
- ID Card: 85×54 mm, 4-per-halaman A4, QR berisi `id|nama|cabang`.

## 6. Navigasi
- Sidebar Sekolah: Ringkasan, Pendaftaran, Pilih Cabang, Profil & Akun.
- Sidebar Panitia: Verifikasi, **Statistik**, **Bracket & Poin**, **Sertifikat**, **ID Card**, **Galeri**, **NPSN Tools**, (Superadmin: Setup).
- Header publik tambah link **Galeri** & **Bagan**.

## 7. Yang **TIDAK** diubah
- WhatsApp gateway, alur verifikasi panitia, data lomba, halaman jadwal/FAQ/kontak, branding hero.

## Catatan keamanan
Anda memilih login NPSN tanpa verifikasi apa pun: siapa pun yang tahu NPSN bisa mendaftarkan tim atas nama sekolah itu. Saya tetap implementasikan, tapi disarankan kemudian menambah OTP WA PIC.
