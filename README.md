# SOCHEN — Dijital İçerik Platformu

Türkçe dijital içerik platformu. Video kurslar, podcast'ler, e-kitaplar, dergiler ve gazeteler için içerik keşfi, abonelik yönetimi ve içerik üretici stüdyosu sunar.

## Mimari

```
digital-content-platform/
├── sochen-backend/      # Spring Boot 3 REST API  (Java 21 · PostgreSQL · Flyway)
└── sochen_frontend/     # React + Vite SPA        (TypeScript · Zustand · Tailwind)
```

## Gereksinimler

| Araç | Sürüm |
|---|---|
| JDK | 21+ |
| Maven (ya da `./mvnw`) | 3.9+ |
| Node.js | 20+ |
| PostgreSQL | 14+ |

## Hızlı Başlangıç

### 1. Veritabanı

```bash
psql -U postgres -c "CREATE USER sochen WITH PASSWORD 'sochen';"
psql -U postgres -c "CREATE DATABASE sochen OWNER sochen;"
```

Docker tercih ediyorsan:

```bash
docker run -d --name sochen-pg \
  -e POSTGRES_USER=sochen -e POSTGRES_PASSWORD=sochen -e POSTGRES_DB=sochen \
  -p 5432:5432 postgres:16
```

### 2. Backend

```bash
cd sochen-backend
./mvnw spring-boot:run
```

İlk açılışta Flyway **V1–V16** migration'larını çalıştırır ve şemayı kurar. API `http://localhost:8080` adresinde hazır olur.

### 3. Frontend

```bash
cd sochen_frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır.

### Demo Girişi

```
E-posta : admin@sochen.com   (veya seed'lenen admin hesabı)
Şifre   : demo123
Rol     : ADMIN
```

## Ortam Değişkenleri (Backend)

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/sochen` | JDBC bağlantı URL'si |
| `DB_USER` | `sochen` | Veritabanı kullanıcısı |
| `DB_PASS` | `sochen` | Veritabanı şifresi |
| `JWT_SECRET` | `sochen-dev-secret-…` | En az 32 karakter, prod'da değiştir |
| `UPLOAD_DIR` | `/tmp/sochen-uploads` | Medya dosyaları için disk yolu |

## Kullanıcı Rolleri

| Rol | Yetkiler |
|---|---|
| `user` | İçerik keşfi, abonelik, indirme, beğeni, takip |
| `creator` | Yukarıdakiler + içerik yükleme/düzenleme/silme, stüdyo istatistikleri |
| `admin` | Yukarıdakiler + moderasyon, kullanıcı yönetimi, analitik, devtools |

Kullanıcılar platform içinden "İçerik Üreticisi Ol" başvurusuyla `creator` rolüne yükseltilebilir; admin onaylar.

## Temel Özellikler

- **İçerik Keşfi** — kategori/konu filtreleme, arama, trend + takip edilen feed
- **Creator Studio** — medya/küçük resim/ek yükleme, içerik yayınlama, beğeni/kazanç istatistikleri, takipçi listesi
- **Abonelik** — Aylık (₺99) ve Yıllık (₺990) planlar, ödeme akışı
- **İndirme Kotası** — Aylık: 10, Yıllık: 20 dosya
- **Heartbeat Gelir Motoru** — İzleme süresine göre içerik üreticisine kazanç kaydı
- **Admin Paneli** — İçerik moderasyonu, kullanıcı yönetimi, finansal analitik, devtools
- **Avatar Yükleme** — Dairesel kırpma + canvas resize ile profil fotoğrafı

## GitHub'a Push

Uzak repo zaten tanımlı (`origin`):

```bash
# Projenin kök dizininden
git add .
git status          # .env ve node_modules görünmemeli
git commit -m "feat: açıklayıcı commit mesajı"
git push origin main
```

İlk kez bağlantı kuruyorsan:

```bash
git remote add origin https://github.com/KULLANICI/REPO.git
git branch -M main
git push -u origin main
```

> `.env`, `node_modules/`, `dist/`, `*.pgsql` dosyaları `.gitignore` tarafından zaten dışlanmıştır.

## Dokümantasyon

- [`sochen-backend/README.md`](sochen-backend/README.md) — API endpoint listesi, DTO kuralları, proje yapısı
- [`sochen_frontend/README.md`](sochen_frontend/README.md) — Frontend bileşen haritası, store mimarisi
