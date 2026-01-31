# RutinApp - README

## 📱 Proje Hakkında

**RutinApp**, günlük rutinlerinizi takip etmenizi ve organize etmenizi sağlayan, modern ve kullanıcı dostu bir Android uygulamasıdır. Angular 19 ve Capacitor ile geliştirilmiştir.

---

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler (v1.0 MVP)

- **Rutin Yönetimi**
  - Rutin ekleme, düzenleme ve silme
  - 8 farklı renk seçeneği
  - Esnek sıklık ayarları (Günlük, Hafta İçi, Hafta Sonu, Özel Günler, Aralıklı)
  
- **Takvim Görünümü**
  - Günlük Liste: Seçilen günün rutinlerini görüntüleme
  - Aylık Takvim: FullCalendar ile görsel takvim
  - Tıkla-tamamla özelliği (hem liste hem takvimde)
  
- **Bildirimler**
  - Capacitor Local Notifications ile rutin hatırlatıcıları
  - Otomatik bildirim zamanlama
  
- **Ayarlar**
  - Karanlık mod (veri kaydı)
  - Bildirim, ses ve titreşim ayarları
  - Dil seçimi (Türkçe/İngilizce)
  
- **Veri Saklama**
  - LocalStorage ile kalıcı veri
  - Angular Signals ile reaktif state yönetimi

### 🚧 Planlanmış Özellikler (v2.0)

- Karanlık mod CSS implementasyonu
- İstatistik ve rapor ekranı
- Özel uygulama ikonu ve splash screen
- Cloud yedekleme (Firebase/Google Drive)
- Detaylı bildirim ayarları

---

## 🛠 Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| Framework | Angular 19 (Standalone Components) |
| Dil | TypeScript 5+ |
| UI | Bootstrap 5 + Bootstrap Icons |
| Mobil | Capacitor 7.x |
| Takvim | FullCalendar |
| Bildirim | Capacitor Local Notifications |
| Reklam | Google AdMob |
| State | Angular Signals |
| Veri | LocalStorage |

---

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Android Studio (APK build için)

### 1. Bağımlılıkları Yükle
```bash
cd d:/PROJECTS/PROJE_FIKIRLERI/RutinApp
npm install
```

### 2. Localhost'ta Çalıştır
```bash
npm start
# Tarayıcıda http://localhost:4200 açılır
```

### 3. Android APK Oluştur
```bash
# 1. Angular app'i build et
npm run build

# 2. Capacitor ile senkronize et
npx cap sync

# 3. Android Studio'da aç
npx cap open android

# Android Studio'da:
# - Gradle Sync tamamlanmasını bekle
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## 📂 Proje Yapısı

```
RutinApp/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/          # Veri modelleri (Routine, UserSettings)
│   │   │   └── services/        # StorageService, NotificationService
│   │   ├── features/
│   │   │   ├── home/            # Ana sayfa
│   │   │   ├── routines/        # Rutin listesi ve modal
│   │   │   ├── calendar/        # Takvim (2 tab)
│   │   │   └── settings/        # Ayarlar
│   │   ├── layout/
│   │   │   ├── header/          # Üst bar
│   │   │   ├── footer/          # Alt navigasyon
│   │   │   └── main-layout/     # Ana layout wrapper
│   │   ├── app.component.ts     # Root component
│   │   └── app.routes.ts        # Routing yapılandırması
│   └── styles.scss              # Global stiller
├── android/                     # Capacitor Android projesi
├── Docs/
│   └── analiz.md                # Teknik analiz dökümanı
└── implementation_plan.md       # Geliştirme planı
```

---

## 🎨 Ekran Görüntüleri

*(Buraya ekran görüntüleri eklenecek)*

---

## 📝 Geliştirme Notları

### Önemli Servisler

#### StorageService
- Rutinleri ve kullanıcı ayarlarını yönetir
- Angular Signals kullanarak reaktif state sağlar
- LocalStorage'a otomatik kaydeder

#### NotificationService
- Capacitor Local Notifications ile bildirim zamanlar
- Şu an sadece DAILY frekansı için tam destek
- Gelecekte tüm frekans tipleri için geliştirilecek

### Bilinen Sınırlamalar (MVP)
- Karanlık mod veri kaydediliyor ama CSS henüz uygulanmıyor
- Bildirimler sadece günlük rutinler için çalışıyor
- Dil değiştirme sadece UI'da, backend logic yok

---

## 🐛 Hata Ayıklama

### AdMob Hatası
Eğer `Missing application ID` hatası alıyorsanız:
1. `android/app/src/main/AndroidManifest.xml` dosyasını kontrol edin
2. `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"` satırını arayın
3. Test ID: `ca-app-pub-3940256099942544~3347511713`

### Build Hatası
Eğer `npm run build` başarısız olursa:
```bash
# Cache temizle
npm cache clean --force

# Node modules yeniden yükle
rm -rf node_modules
npm install
```

---

## 📄 Lisans

Bu proje özel bir projedir.

---

## 👨‍💻 Geliştirici

Geliştirme tarihi: Ocak 2026

**Son Güncelleme:** 31 Ocak 2026, 20:33
