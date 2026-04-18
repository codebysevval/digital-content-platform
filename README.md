**🚀 Dijital İçerik Platformu - Kurulum Rehberi**
Merhaba arkadaşlar! Bu proje bizim ortak çalışma alanımız. Projeyi kendi bilgisayarınızda sorunsuz çalıştırmak için aşağıdaki adımları takip etmeniz yeterli.

1️⃣ Adım: Bilgisayara İndirme (Clone/Pull)
Önce projenin bir kopyasını kendi bilgisayarınıza almalısınız.

Eğer ilk kez indirecekseniz: git clone https://github.com/codebysevval/digital-content-platform.git

Daha önce indirdiyseniz: git pull origin main yaparak son güncellemeleri çekin.

2️⃣ Adım: PostgreSQL Hazırlığı
Kodun çalışması için bilgisayarınızda PostgreSQL kurulu olmalıdır.

Eğer yüklü değilse: PostgreSQL resmi sayfasından indirip kurun ve kurulumda belirlediğiniz şifreyi not edin.

Veritabanı Şeması: Herhangi bir veritabanı arayüzünü (pgAdmin vb.) açın. Proje içindeki database_schema.sql dosyasındaki kodları kopyalayıp, varsayılan olarak gelen postgres isimli veritabanında çalıştırın. Tablolar otomatik oluşacaktır.

3️⃣ Adım: Ayarları Kendinize Göre Düzenleme
Herkesin bilgisayar şifresi farklı olduğu için koda kendi şifrenizi tanıtmalısınız.

src/main/resources/application.properties dosyasını bulun ve açın.

Şu satırı kendi PostgreSQL şifrenizle değiştirin:
spring.datasource.password=BURAYA_KENDI_SIFRENIZI_YAZIN

4️⃣ Adım: Projeyi Çalıştırma
IntelliJ Community (ücretsiz) sürümünde üstteki yeşil buton çalışmayabilir. Bu durumda:

IDE İçinden: src/main/java altındaki ana uygulama dosyasını (Application.java) bulun ve main metodunun solundaki küçük Yeşil Oynat simgesine tıklayın.

Terminalden: Terminale şu komutu yazıp Enter'a basın:
./mvnw spring-boot:run

**⚠️ Dikkat Etmemiz Gerekenler (Git Kuralları)**
Çalışmaya Başlamadan Önce: Mutlaka git pull yapın (başkası bir şey eklediyse size de gelsin).

İşiniz Bitince: Kodunuzu kaydedip GitHub'a göndermeyi unutmayın (git add . -> git commit -> git push).

Hata Alırsanız: Gruptan ekran görüntüsü atın, beraber çözelim! 🧑‍💻✨
Geliştirme Sonrası: Kodlarınızı git push ile göndermeden önce projenin hatasız çalıştığından emin olun.
