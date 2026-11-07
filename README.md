# Website 5,74 A

Website kelas satu halaman (HOME · TENTANG · MEDIA · STRUKTUR · ANGGOTA · PRESTASI) dengan login,
galeri foto, struktur kelas bergaya neon, 32 profil anggota (lengkap dengan album foto), dan panel admin.
Statis (HTML + CSS + JS), bisa langsung di-deploy ke Vercel.

## PENTING: agar data sama di HP dan laptop
Data hanya akan sama di semua perangkat kalau website **tersambung ke database** (Supabase, gratis).
Tanpa itu, website berjalan sebagai demo dan setiap browser menyimpan datanya sendiri-sendiri
(itulah sebabnya data yang disimpan di HP tidak muncul di laptop). Ikuti langkah 2 di bawah.

## 1. Coba dulu di komputer (mode demo)
Buka `index.html` di browser. Daftar akun, **akun pertama otomatis jadi admin**. Data demo hanya ada di browser itu.

## 2. Hubungkan database (Supabase, gratis)
1. Buat project di https://supabase.com
2. Buka **SQL Editor** → tempel seluruh isi `supabase.sql` → **Run**
3. **Authentication → Providers → Email** → matikan **Confirm email**
4. **Project Settings → API** → salin **Project URL** dan **anon public key** ke `config.js`
5. Simpan perubahan `config.js` ke GitHub (commit). Vercel akan deploy ulang otomatis.
6. Buka website, daftar akun kamu, lalu jadikan admin lewat SQL Editor:
   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'EMAIL_KAMU@gmail.com');
   ```
7. Login ulang. Menu **ADMIN** muncul di navbar.

Setelah ini, apa pun yang diunggah dari HP atau laptop tersimpan di database yang sama. Perubahan dari
satu perangkat muncul di perangkat lain dalam hitungan detik (tanpa perlu refresh).
Catatan: login tetap dilakukan sekali di tiap perangkat, tapi datanya sama.

## 3. Isi website lewat menu Admin
- **Info Website**: deskripsi kelas, kalimat halaman depan, jumlah laki-laki/perempuan, link IG / TikTok / YouTube,
  foto latar halaman depan, dan foto kelas (bagian Tentang).
- **Daftar Anggota**: tempel 32 nama sekaligus (1 nama per baris), lalu isi username tiap anak.
- **Struktur**: buka bagian Struktur, ketuk kotak jabatan, ketik nama (pilih dari daftar anggota agar terhubung ke profilnya).
- **Pengguna**: jadikan teman sebagai admin.

Foto latar bisa juga ditaruh sebagai file `assets/hero.jpg` dan `assets/about.jpg` di dalam folder ini.

## 4. Deploy ke Vercel (dan kalau muncul 404)
- Upload **isi** folder ini ke GitHub. `index.html` harus berada di **paling luar (root)** repositori,
  bukan di dalam subfolder dan bukan berupa file .zip.
- Di vercel.com pilih **Add New → Project → Import**. Framework: *Other*. Build Command dan Output Directory dikosongkan.
- 404 hampir selalu berarti `index.html` tidak ada di root. Kalau sudah terlanjur di subfolder, isi
  **Settings → General → Root Directory** dengan nama subfolder itu, lalu Redeploy.

## Hak akses
- **Anggota**: unggah foto, prestasi, dan foto ke album anak mana pun; hanya bisa menghapus miliknya sendiri.
- **Admin**: bisa menghapus apa pun, edit profil anggota, atur struktur, link sosmed, dan peran pengguna.


## Pasang sebagai aplikasi (PWA)
Setelah login di HP, muncul tawaran "Pasang aplikasi 5,74 A?". Android/Chrome: tekan **Pasang**. iPhone/Safari: ketuk **Bagikan -> Tambah ke Layar Utama** (iOS tidak mengizinkan tombol otomatis). Kalau memilih "Nanti", tawaran muncul lagi 7 hari kemudian. Fitur ini hanya jalan di alamat https (Vercel otomatis https).

## Admin pertama
Setelah menjalankan `supabase.sql`, **orang pertama yang mendaftar otomatis jadi admin**. Daftarkan akunmu sendiri lebih dulu.
