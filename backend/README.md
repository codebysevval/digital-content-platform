# Dijital Icerik Abonelik Platformu - Backend

Bu backend, Figma'daki User Dashboard Design ekranlarini canli veriyle calistirmak icin hazirlandi.
Referans tasarim: [Figma User Dashboard Design](https://www.figma.com/make/OwDfaBo61DTm2eF8DLTpDl/User-Dashboard-Design?t=7KQvXyARZPlKURjF-1)

## Figma Veri Alanlari Analizi

Dashboard tarafinda gorsel olarak bulunan ana veri alanlari backend'de su sekilde karsilanir:

- Kullanici profili: `username`, `fullName`, `email`, `role`
- Abonelik paketleri: `planName`, `price`, `currency`, `billingCycle`, `active`
- Icerik kartlari: `title`, `category`, `thumbnailUrl`, `durationMinutes`, `premium`
- Sayisal kutular: `totalSubscriptions`, `activeSubscriptions`, `totalContents`, `premiumContents`, `totalCategories`
- Kategori listesi: kullanicinin erisebildigi iceriklerden uretilen `categories`

## Veritabani Yapisi

`src/main/resources/schema.sql` dosyasi uygulama acilisinda otomatik calisir ve tablolari olusturur:

- `users`
- `subscriptions`
- `contents`
- `user_contents` (Many-to-Many join table)

## Mock Data (Canliya Yakin)

`src/main/resources/data.sql` dosyasi:

- 5 kullanici (1 tanesi `ADMIN`)
- 3 farkli paket tipi (`Basic`, `Premium`, `Team`)
- Dashboard kartlarini besleyen 10 icerik
- Iliski kayitlariyla gercekci kullanici-erisim dagilimi

Tum sifreler `123456` degerinin BCrypt hash halidir; sistem acilir acilmaz login yapilabilir.

## Entegrasyon Notu (Frontend + Backend)

- Proje artik net olarak iki klasore ayrildi:
  - `Abonelik_Sistemi/backend` -> Spring Boot API
  - `Abonelik_Sistemi/frontend` -> React (Vite) arayuzu
- Frontend login/register formlari dogrudan backend endpointlerine baglandi:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
- Dashboard ekrani `GET /api/dashboard/me` endpointinden canli veri cekiyor.

## Guvenlik ve Auth

- `POST /api/auth/register`: yeni kullanici olusturur, sifreyi BCrypt ile hashler, varsayilan `ROLE_USER` atar.
- `POST /api/auth/login`: kimlik dogrular, JWT ve kullanici ozetini dondurur (username veya email ile login desteklenir).
- `POST /api/contents` ve `DELETE /api/contents/{id}` sadece `ROLE_ADMIN` kullanicilarina aciktir.
- CORS ayarlari ile `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000` originlerinden API erisimi izinlidir.

## Dashboard Endpoint

- `GET /api/dashboard/me`
  - Profil bilgisi
  - Sayisal dashboard ozetleri
  - Kategori listesi
  - Kullaniciya ait abonelik paketleri
  - Kullaniciya acik icerik kartlari

## Postman Test Tablosu

Base URL: `http://localhost:8080`

| Ekran | Endpoint | Method | Auth | Ornek JSON Body |
|---|---|---|---|---|
| Register | `/api/auth/register` | POST | Yok | `{"username":"newuser","password":"123456","email":"newuser@example.com","fullName":"New User"}` |
| Login | `/api/auth/login` | POST | Yok | `{"email":"hatice@example.com","password":"123456"}` |
| Dashboard | `/api/dashboard/me` | GET | Bearer JWT | `-` |
| Tum kullanicilar | `/api/users` | GET | Bearer JWT | `-` |
| Kullanici detayi | `/api/users/{id}` | GET | Bearer JWT | `-` |
| Tum abonelikler | `/api/subscriptions` | GET | Bearer JWT | `-` |
| Abonelik detayi | `/api/subscriptions/{id}` | GET | Bearer JWT | `-` |
| Tum icerikler | `/api/contents` | GET | Yok | `-` |
| Icerik detayi | `/api/contents/{id}` | GET | Yok | `-` |
| Icerik ekle (admin) | `/api/contents` | POST | Bearer JWT (ADMIN) | `{"title":"Yeni Kart","category":"Mobil","thumbnailUrl":"https://picsum.photos/seed/new/600/400","durationMinutes":30,"premium":true}` |
| Icerik sil (admin) | `/api/contents/{id}` | DELETE | Bearer JWT (ADMIN) | `-` |

## Flutter Entegrasyonu

Backend DTO'lariyla birebir uyumlu `json_serializable` modeller:

- `flutter_bridge/lib/models/auth_response_model.dart`
- `flutter_bridge/lib/models/user_session_model.dart`
- `flutter_bridge/lib/models/subscription_model.dart`
- `flutter_bridge/lib/models/content_model.dart`
- `flutter_bridge/lib/models/dashboard_stats_model.dart`
- `flutter_bridge/lib/models/user_dashboard_model.dart`
- `flutter_bridge/lib/models/login_request_model.dart`
- `flutter_bridge/lib/models/register_request_model.dart`
- `flutter_bridge/lib/services/api_service.dart`

Flutter tarafinda paketler:

```bash
flutter pub add dio json_annotation
flutter pub add --dev build_runner json_serializable
flutter pub run build_runner build --delete-conflicting-outputs
```

## Not

Controller ve servis metodlarina detayli Turkce aciklamalar eklendi. Kod okunurken her metodun hangi Figma ekranina karsilik geldigi hizlica izlenebilir.

## Calistirma Talimati (Adim Adim)

### 1) Backend'i baslat

1. Terminal ac:
2. Backend klasorune gir:
   ```bash
   cd backend
   ```
3. Spring Boot'u baslat:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Uygulama acilisinda:
   - veritabani otomatik olusur (`schema.sql`)
   - mock veriler otomatik yuklenir (`data.sql`)

### 2) Frontend'i baslat

1. Ikinci terminal ac:
2. Frontend klasorune gir:
   ```bash
   cd frontend
   ```
3. Paketleri kur:
   ```bash
   npm install
   ```
4. Vite dev server'i baslat:
   ```bash
   npm run dev
   ```
5. Tarayicida ac:
   - `http://localhost:5173`

### 3) Giris bilgileri

- Normal kullanici: `hatice@example.com / 123456`
- Admin kullanici: `admin@example.com / 123456`

### 4) Tek Run hedefi (tek porttan servis)

- Frontend build alindiktan sonra `frontend/dist` icerigini `backend/src/main/resources/static` altina kopyalayarak arayuzu backend icinden de servis edebilirsin.
- Bu durumda sadece backend komutu yeterli olur:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```
