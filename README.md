**Abonelik Yönetim Sistemi (Digital Content Platform)**

Bu proje, Spring Boot ve PostgreSQL kullanılarak geliştirilen bir abonelik yönetim sistemidir. Ekip olarak uyumlu çalışabilmemiz için lütfen aşağıdaki adımları takip edin.

**🛠️ Kurulum ve Başlatma**

Projeyi bilgisayarınıza ilk kez çekecekseniz veya güncelleyecekseniz:

Projeyi Klonlayın:

git clone https://github.com/codebysevval/digital-content-platform.git

Bağımlılıkları Yükleyin:

IntelliJ IDEA'da projeyi açtığınızda sağ altta çıkan bildirimden "Load Maven Project" deyin.

Eğer bağımlılıklar inmezse, sağdaki Maven sekmesine tıklayıp "Reload All Maven Projects" (döngü ikonu) butonuna basın.

Veritabanı Ayarları:

src/main/resources/application.properties dosyasını açın.

spring.datasource.username ve password kısımlarını kendi yerel PostgreSQL bilgilerinizle güncelleyin.

Uygulamayı Çalıştırın:

com.example.demo paketi altındaki DemoApplication.java dosyasını bulun ve yeşil Play butonuna basın.

🔄 GitHub Çalışma Akışı (Önemli!)
Kod yazmaya başlamadan ve bitirdikten sonra çakışma (conflict) yaşamamak için şu sırayı izleyelim:

1. Çalışmaya Başlamadan Önce (Pull)
Başkası bir kod yüklediyse onu kendi bilgisayarınıza çekmek için:

git pull origin main

2. Değişiklikleri Kaydetme (Commit)
Kodunuzu yazdınız ve her şeyin çalıştığından eminsiniz:


git add .
git commit -m "Ne yaptığınızı kısaca buraya yazın (Örn: User Service eklendi)"

3. Kodları Gönderme (Push)
Kendi kodunuzu göndermeden önce mutlaka tekrar bir pull yapın:

git pull origin main
git push origin main

**Not:**Eğer git pull yaptığınızda bir çakışma (conflict) uyarısı alırsanız, IntelliJ içindeki "Merge" ekranından hangi kodun kalacağını seçin veya benimle iletişime geçin
