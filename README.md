**🚀 Dijital İçerik Abonelik Sistemi**

Bu proje, Spring Boot ve PostgreSQL kullanılarak geliştirilmiş bir backend sistemidir.

**🛠️ Kurulum ve Çalıştırma**

Projeyi çalıştırmadan önce bilgisayarınızda PostgreSQL kurulu olduğundan emin olun.

1. Ön Hazırlık (PostgreSQL Yoksa)
Eğer yüklü değilse, PostgreSQL resmi sayfasından işletim sisteminize uygun sürümü indirin ve kurun.

Kurulum sırasında belirlediğiniz şifreyi bir kenara not edin.

2. Veritabanı Şeması
Veritabanı arayüzünüzü (pgAdmin vb.) açın.

Proje içinde bulunan database_schema.sql dosyasındaki SQL kodlarını kopyalayıp, varsayılan olarak gelen postgres isimli veritabanında çalıştırın. Bu işlem gerekli tabloları otomatik oluşturacaktır.

3. Şifre Güncelleme (Önemli!)
src/main/resources/application.properties dosyasını açın.

spring.datasource.password satırına kendi PostgreSQL şifrenizi yazın:

Properties
spring.datasource.password=KENDI_SIFRENIZ
4. Projeyi Başlatma (IntelliJ Community)
Ücretsiz sürümde Spring Boot butonu çalışmayabileceği için:

IDE İçinden: Application.java dosyasındaki main metodunun solundaki yeşil oynat simgesine tıklayın.

Terminalden: Proje ana dizinindeyken şu komutu çalıştırın:

Bash
./mvnw spring-boot:run

**👥 Ekip Notları**
Başlamadan Önce: git pull origin main yaparak son kodları çekmeyi unutmayın.

Geliştirme Sonrası: Kodlarınızı git push ile göndermeden önce projenin hatasız çalıştığından emin olun.
