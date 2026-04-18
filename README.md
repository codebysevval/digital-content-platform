**🚀 Dijital İçerik Abonelik Sistemi**
Bu proje, Spring Boot ve PostgreSQL kullanılarak geliştirilen, kullanıcıların dijital içerik aboneliklerini yönetebileceği bir backend sistemidir.

🛠️ Kurulum ve Çalıştırma
Projeyi yerel bilgisayarınızda ayağa kaldırmak için aşağıdaki adımları takip ediniz.

1. Veritabanı Yapılandırması (PostgreSQL)
pgAdmin 4 üzerinden Abonelik_Sistemi adında yeni bir veritabanı oluşturun.

src/main/resources/database_schema.sql dosyasındaki SQL komutlarını kopyalayın ve oluşturduğunuz veritabanının Query Tool kısmında çalıştırarak tabloları oluşturun.

2. Uygulama Ayarları
src/main/resources/application.properties dosyasını açın.

spring.datasource.password kısmına kendi PostgreSQL şifrenizi yazın:

Properties
spring.datasource.password=KENDI_SIFRENIZ

3. Projeyi Çalıştırma (IntelliJ Community Sürümü)
Ücretsiz sürümde Spring Boot "Run" butonu aktif olmayabilir. Bu durumda şu yöntemleri kullanabilirsiniz:

Yöntem A (IDE İçinden): src/main/java klasörü altındaki ana uygulama dosyasını (örneğin DemoApplication.java) bulun. Dosya içindeki main metodunun solundaki küçük yeşil oynat simgesine tıklayarak Run seçeneğini seçin.

Yöntem B (Terminalden - En Garanti Yol):
IntelliJ terminalini açın ve projenin ana dizinindeyken şu komutu çalıştırın:

Bash
./mvnw spring-boot:run

**👥 Ekip Kuralları ve Git Kullanımı**

Güncel Kalın: Her çalışmaya başlamadan önce mutlaka git pull origin main yaparak son kodları çekin.

Paylaşım: Yeni bir özellik eklediğinizde veya hata çözdüğünüzde;

git add .

git commit -m "Yaptığınız işlemin kısa açıklaması"

git push origin main
komutlarını sırasıyla kullanarak güncellemeleri paylaşın.
