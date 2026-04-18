**Dijital İçerik Platformu - Kurulum & Çalıştırma Rehberi**
Projemizin son halini (Veritabanı bağlantısı yapılmış ve stabil sürüm) GitHub'a yükledim. Kendi yerelinizde sorunsuz çalıştırmak için lütfen aşağıdaki adımları sırayla takip edin:

1️⃣ Projeyi Bilgisayarınıza İndirin (Clone)
Eğer projeyi daha önce indirdiyseniz, terminale git pull yazarak güncel dosyaları çekin. İlk kez indirecekseniz:

Boş bir klasörde terminali açın ve şu komutu çalıştırın:
git clone https://github.com/codebysevval/digital-content-platform.git

2️⃣ Veritabanını Hazırlayın (PostgreSQL)
Kodun tabloları okuyabilmesi için bilgisayarınızda bir veritabanı olmalı:

pgAdmin 4'ü açın.

Databases üzerine sağ tıklayın -> Create -> Database...

İsim kısmına tam olarak şunu yazın: Abonelik_Sistemi

Save butonuna basarak kaydedin.

3️⃣ SQL Şemasını Tanımlayın (Önemli!)
Tabloların oluşması için projeye eklediğim SQL dosyasını bir kez çalıştırmanız gerekiyor:

Proje içinde src/main/resources/database_schema.sql dosyasını bulun.

Bu dosyadaki kodları kopyalayıp pgAdmin'deki Query Tool üzerinde çalıştırın veya IntelliJ içindeki veritabanı panelinden public şemasına aktarın.

4️⃣ Kendi Ayarlarınızı Yapın
Herkesin bilgisayar şifresi farklı olduğu için koda kendi şifrenizi tanıtmalısınız:

IntelliJ içinde src/main/resources/application.properties dosyasını açın.

Şu satırları kendi bilgilerinizle güncelleyin:

Properties
spring.datasource.username=postgres
spring.datasource.password=BURAYA_KENDI_POSTGRES_SIFRENIZI_YAZIN
5️⃣ Projeyi Çalıştırın
IDE'nizin üstündeki Yeşil Oynat (Run) butonuna basın.

Konsolda "Started DemoApplication" yazısını gördüyseniz sistem ayakta demektir!

Kontrol için tarayıcınızdan http://localhost:8080 adresine gidebilirsiniz.

**⚠️ Git Kuralları (Hatırlatma):**

Çalışmaya başlamadan önce mutlaka git pull yapın (benim veya başkasının eklediği güncel kodlar size gelsin).

Yeni bir özellik eklediğinizde kodunuzu kaydedip git push yapmayı unutmayın.

Takıldığınız bir yer olursa gruptan ekran görüntüsü atın, beraber bakalım! 🧑‍💻✨
