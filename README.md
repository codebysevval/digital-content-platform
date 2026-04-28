# Dijital Icerik Abonelik Platformu - Backend

Spring Boot tabanli bu servis, dijital icerik aboneligi senaryosu icin temel kimlik dogrulama, kullanici, abonelik ve icerik API'lerini saglar. Varsayilan olarak H2 ile aninda ayaga kalkar, istenirse PostgreSQL profiline gecilir.

## 1) Teknoloji Yigini

- Java 17
- Spring Boot 3.2.5
- Spring Web
- Spring Security (JWT)
- Spring Data JPA (Hibernate)
- H2 (default, in-memory)
- PostgreSQL
- Lombok

## 2) Mimari Ozet

Katmanlar:

- `controller`: REST endpoint'leri
- `service`: is kurallari
- `repository`: JPA veri erisimi
- `entity`: veritabani modeli
- `dto`: API request/response modelleri
- `mapper`: entity <-> dto donusumleri
- `exception`: merkezi hata yonetimi
- `config`: security ve bean konfigurasyonu

### Entity Iliskileri

- `User` -> `Subscription`: **OneToMany**
  - Bir kullanicinin birden fazla aboneligi olabilir.
  - FK: `subscriptions.user_id -> users.id`
- `User` <-> `Content`: **ManyToMany**
  - Bir kullanici birden cok icerige erisebilir.
  - Bir icerik birden fazla kullaniciya acik olabilir.
  - Join table: `user_contents`

## 3) Veritabani Profilleri ve Kurulum

### Default: H2 (onerilen ilk calistirma)

- Ekstra kurulum gerekmez.
- Uygulama acilisinda in-memory veritabani otomatik olusur.
- H2 console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:abonelikdb`
  - Username: `sa`
  - Password: (bos)

### PostgreSQL profili

1. PostgreSQL'de veritabani olustur:
   - `abonelik_sistemi`
2. `src/main/resources/application-postgres.properties` icindeki bilgileri kendi ortamina gore guncelle:
   - `spring.datasource.url`
   - `spring.datasource.username`
   - `spring.datasource.password`
3. Ilk acilista schema Hibernate tarafindan olusturulur (`ddl-auto=update`).
4. `data.sql` otomatik calisir ve ornek veri yukler.

### Ornek connection

- URL: `jdbc:postgresql://localhost:5432/abonelik_sistemi`
- Username: `postgres`
- Password: `postgres`

## 4) Uygulamayi Calistirma

### Maven ile (default H2)

```bash
mvn clean spring-boot:run
```

### Maven ile (PostgreSQL profili)

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

### Jar ile

```bash
mvn clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

Default port: `8080`

## 5) Hazir Seed Data

`data.sql` su kayitlari ekler:

- 2 kullanici (`hatice`, `admin`)
- 3 icerik
- 2 abonelik
- `user_contents` iliski kayitlari

Not: seed parola degeri her iki kullanici icin de BCrypt olarak `123456`'dir.

## 6) API Endpoint Listesi

Base URL: `http://localhost:8080`

### Authentication

- `POST /api/auth/register`
  - Yeni kullanici kaydi
  - Body:
    ```json
    {
      "username": "newuser",
      "password": "123456",
      "email": "newuser@example.com",
      "fullName": "New User"
    }
    ```
  - Response: JWT token
- `POST /api/auth/login`
  - Giris yapar
  - Body:
    ```json
    {
      "username": "hatice",
      "password": "123456"
    }
    ```
  - Response: JWT token

### Users

- `GET /api/users`
  - Tum kullanicilari listeler (DTO doner, password donmez)
- `GET /api/users/{id}`
  - Belirli kullaniciyi getirir

### Subscriptions

- `GET /api/subscriptions`
  - Tum abonelikleri listeler
- `GET /api/subscriptions/{id}`
  - Abonelik getirir
  - Sure dolmussa `SubscriptionExpiredException` firlatilir

### Contents

- `GET /api/contents`
  - Tum icerikleri listeler
- `GET /api/contents/{id}`
  - Tekil icerik getirir

## 7) Hata Yonetimi

`@RestControllerAdvice` ile merkezi olarak yonetilir:

- `ResourceNotFoundException` -> 404
- `SubscriptionExpiredException` -> 403
- `BadCredentialsException` -> 401
- `MethodArgumentNotValidException` -> 400
- Genel `Exception` -> 500

Tum hata cevaplari standart `ErrorResponse` yapisindadir:

- `timestamp`
- `status`
- `error`
- `message`

## 8) Guvenlik Notlari

- Controller katmaninda entity yerine DTO kullanilir.
- Password alanlari API response'larinda asla donmez.
- JWT tabanli stateless security yapisi kullanilir.
- `/api/auth/**` ve `/api/contents/**` public, diger endpoint'ler auth gerektirir.

## 9) Yol Haritasi (Acik Gorevler)

Kod icinde TODO olarak isaretli:

- Payment Gateway entegrasyonu (`SubscriptionService`)
- Gelismis icerik filtreleme (`ContentService`)

## 10) Takim Devri Notu 

- Projeyi clone ettikten sonra Java 17 ile direkt calistirabilirsin (H2 default oldugu icin).
- PostgreSQL ile devam edeceksen sadece `application-postgres.properties` dosyasini guncelleyip `postgres` profiliyle calistir.
- Uygulamayi kaldirdiginda bos ekran yerine seed veriler hemen gorulur.
- Is mantigi servis katmaninda, API sozlesmeleri DTO katmaninda tutuldugu icin kodu takip etmek kolaydir.
- Ilk test icin: once `POST /api/auth/login`, sonra JWT ile korumali endpoint'lere istek at.
