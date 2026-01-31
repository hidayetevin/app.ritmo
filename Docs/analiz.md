# RutinApp - Detaylı Teknik Analiz ve Gereksinim Dökümanı

## 1. Proje Özeti
Android platformunda çalışacak, kullanıcıların günlük, haftalık veya özel periyotlarla rutinlerini takip etmesini sağlayan, modern arayüze sahip bir "Rutin Hatırlatıcı" uygulamasıdır.

## 2. Teknoloji Yığını (Tech Stack)
Uygulama, sürdürülebilirlik, performans ve UI gereksinimleri gözetilerek aşağıdaki teknolojilerle geliştirilmiştir:
*   **Framework:** Angular 19 (Standalone Components yapısı ile) ✅
*   **Dil:** TypeScript 5+ ✅
*   **UI Kütüphanesi:** Bootstrap 5 (Responsive Grid ve Utility classlar için) ✅
*   **İkon Seti:** Bootstrap Icons ✅
*   **Mobil Paketleme:** Capacitor (Android build için) ✅
*   **Veri Saklama:** LocalStorage (Signals ile reaktif state yönetimi) ✅
*   **Takvim:** FullCalendar (Angular entegrasyonu) ✅
*   **Bildirimler:** Capacitor Local Notifications Plugin ✅
*   **Reklam:** Google AdMob (Capacitor Community AdMob Plugin) ✅

## 3. Veri Modeli (Data Structures)

### 3.1. Routine (Rutin) Modeli
```typescript
interface Routine {
  id: string;              // UUID
  title: string;           // Rutin adı (Örn: "Su İç")
  description?: string;    // İsteğe bağlı açıklama
  color: string;           // Kartın arka plan rengi (Hex code)
  
  // Zamanlama Ayarları
  frequencyType: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'SPECIFIC_DAYS' | 'INTERVAL';
  specificDays?: number[]; // 0=Pazar, 1=Pzt... (frequencyType == SPECIFIC_DAYS ise)
  intervalDays?: number;   // Kaç günde bir? (frequencyType == INTERVAL ise)
  
  startDate: Date;         // Başlangıç tarihi
  endDate?: Date;          // Bitiş tarihi (Opsiyonel)
  time: string;           // Saat (HH:mm formatında)
  
  // Durum
  isActive: boolean;       // Rutin aktif mi?
  
  // Takip
  completionHistory: string[]; // Tamamlanan tarihlerin listesi (ISO String)
}
```

### 3.2. UserSettings (Kullanıcı Ayarları)
```typescript
interface UserSettings {
  isDarkMode: boolean;
  language: 'tr' | 'en';
  notificationsEnabled: boolean;
  soundEnabled: boolean; // Uygulama içi sesler
  vibrationEnabled: boolean; // Titreşim
}
```

## 4. Uygulama Mimarisi ve Ekranlar

### 4.1. Genel Tasarım (Layout) ✅
*   **Header:** 
    *   Uygulama Logosu/İsmi ("RutinApp").
    *   **Reklam Alanı:** Header içinde placeholder (AdMob test ID ile yapılandırıldı).
*   **Body:** Scroll edilebilir dinamik içerik alanı (Router Outlet).
*   **Footer (Bottom Navigation Bar):**
    *   Ana Sayfa (Home) ✅
    *   Takvim (Calendar) ✅
    *   Rutinlerim (Routines) ✅
    *   Hesap (Account/Settings) ✅

### 4.2. Ana Sayfa (Home Screen) ✅
*   **Amaç:** Kullanıcıyı karşılamak ve uygulamanın durumunu özetlemek.
*   **İçerik:** 
    *   Hoş geldin mesajı ve güncel tarih.
    *   Aktif rutin sayısı özeti.
    *   "Yeni Rutin Ekle" hızlı aksiyon butonu.

### 4.3. Rutinlerim Ekranı (Routines Screen) ✅
*   **Grid Yapısı:** 
    *   Angular `@for` ile dönen kartlar.
    *   Mobilde yan yana 2 kart (col-6), tablette 3-4 kart (responsive).
*   **Rutin Kartı (Cell) Tasarımı:**
    *   Üst kenarda rutin rengi ile border.
    *   Başlık (kalın font, truncate).
    *   Sıklık bilgisi (badge).
    *   Saat bilgisi (ikon ile).
    *   "Güncelle" yazısı ve "Sil" ikonu.
*   **Empty State:** "Henüz rutin eklenmemiş" mesajı ve ikon.
*   **Modal:** Kart tıklandığında düzenleme modalı açılır.

### 4.4. Rutin Ekleme/Güncelleme (Modal Component) ✅
*   Reactive Forms ile validasyon.
*   **Form Alanları:**
    *   **Ad:** Text Input (zorunlu).
    *   **Renk:** 8 renkli palet (seçilebilir butonlar).
    *   **Sıklık Tipi:** Radio butonlar (Her Gün, Hafta İçi, Hafta Sonu, Seçili Günler, Aralıklı).
    *   **Seçili Günler:** Pazartesi-Pazar checkbox'ları (sıklık = Specific Days ise aktif).
    *   **Zaman:** Time picker (input type="time").
    *   **Başlangıç Tarihi:** Date picker.
*   **Kaydet:** Validasyon sonrası StorageService'e kaydeder.

### 4.5. Takvim Ekranı (Calendar) ✅ **YENİ ÖZELLIKLER**
Takvim ekranı **2 sekmeye** ayrıldı:

#### Tab 1: Günlük Liste ✅
*   Seçilen günün rutinlerini grid olarak gösterir.
*   İleri/geri butonlarla tarih değişimi.
*   **Tamamlama İşaretleme:** Kart tıklandığında o rutin "tamamlandı" olarak işaretlenir, yeşile döner.

#### Tab 2: Aylık Takvim Görünümü ✅
*   **Kütüphane:** FullCalendar.
*   **Görünüm:** Ay görünümü.
*   **Özellikler:**
    *   Rutinler takvimde renklerine göre işaretlenir.
    *   Tamamlanan rutinlerde "✔" işareti ve yeşil renk.
    *   **Tıklanabilir:** Event üzerine tıklandığında onay penceresi ile tamamlama durumu değiştirilir.

### 4.6. Ayarlar Ekranı (Settings) ✅
*   Liste görünümü.
*   Her satırda ayar adı ve sağda Switch (Toggle) butonu.
*   **Ayarlar:**
    *   Karanlık Mod (Dark Mode) - Veri kaydediliyor.
    *   Dil Seçimi (Türkçe/İngilizce dropdown).
    *   Bildirimler Aktif/Pasif.
    *   Ses Aktif/Pasif.
    *   Titreşim Aktif/Pasif.

## 5. Kritik İşlevler (Business Logic)

### 5.1. Bildirim Yönetimi ✅
*   `NotificationService` implementasyonu tamamlandı.
*   Rutin eklendiğinde/güncellendiğinde:
    1.  Mevcut bildirimler iptal edilir.
    2.  Yeni bildirimler (şu an DAILY frekansı için) schedule edilir.
*   Rutin silindiğinde: İlgili bildirimler iptal edilir.
*   **Not:** Şu an sadece DAILY frekansı desteklenmektedir. Diğerleri için tarih hesaplaması eklenmesi gerekir.

### 5.2. Veri Kalıcılığı (Persistence) ✅
*   `StorageService` Angular Signals kullanarak reaktif state yönetimi sağlar.
*   LocalStorage'a otomatik kaydedilir (effect ile).
*   Uygulama açılışında veriler yüklenir.
*   Kullanıcı değişiklikleri anında saklanır.

### 5.3. Tamamlama Takibi ✅
*   `toggleRoutineCompletion(routineId, date)` metodu ile kullanıcı rutini işaretleyebilir.
*   Takvimde (hem liste hem aylık görünümde) görsel feedback: yeşil renk + ✔ işareti.

## 6. Geliştirme Durumu

### ✅ Tamamlananlar (Phase 1 - MVP)
- [x] Proje kurulumu (Angular 19, Capacitor, Bootstrap)
- [x] Core Servisler (StorageService, NotificationService)
- [x] Layout ve Navigasyon (Header, Footer, Router)
- [x] Ana Sayfa (Home)
- [x] Rutinlerim Ekranı (Grid + Modal)
- [x] Rutin Ekleme/Düzenleme Modalı (Reactive Forms + Validasyon)
- [x] Takvim Ekranı (2 Tab: Liste + FullCalendar)
- [x] Ayarlar Ekranı
- [x] Tamamlama İşaretleme Özelliği
- [x] LocalStorage Entegrasyonu
- [x] Android Manifest AdMob Konfigürasyonu
- [x] Varsayılan Angular Template Kaldırıldı

### 🚧 Devam Edenler / İyileştirmeler (Phase 2)
- [ ] Karanlık Mod CSS implementasyonu
- [ ] İleri seviye bildirim sıklıkları (Interval, Specific Days)
- [ ] Dil değiştirme logic (Angular i18n)
- [ ] İstatistik/Rapor ekranı
- [ ] Uygulama ikonu ve Splash Screen
- [ ] Production AdMob ID entegrasyonu

## 7. Build ve Deploy

### Web (Localhost Test)
```bash
npm start  # http://localhost:4200
```

### Android APK
```bash
npm run build
npx cap sync
npx cap open android
# Android Studio'dan Build > Build APK
```

## 8. Notlar
*   **Angular versiyon:** 19.2.18
*   **Bootstrap versiyon:** 5.x
*   **Capacitor versiyon:** 7.x
*   **AdMob Test ID:** `ca-app-pub-3940256099942544~3347511713`

---
**Son Güncelleme:** 31 Ocak 2026, 20:33
