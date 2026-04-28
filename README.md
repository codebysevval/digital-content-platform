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

## Guvenlik ve Auth

- `POST /api/auth/register`: yeni kullanici olusturur, sifreyi BCrypt ile hashler, varsayilan `ROLE_USER` atar.
- `POST /api/auth/login`: kimlik dogrular, JWT ve kullanici ozetini dondurur.
- `POST /api/contents` ve `DELETE /api/contents/{id}` sadece `ROLE_ADMIN` kullanicilarina aciktir.

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
| Login | `/api/auth/login` | POST | Yok | `{"username":"hatice","password":"123456"}` |
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

## Hatice Icin Not

Controller ve servis metodlarina detayli Turkce aciklamalar eklendi. Kod okunurken her metodun hangi Figma ekranina karsilik geldigi hizlica izlenebilir.
