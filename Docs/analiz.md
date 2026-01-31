# Ritmo - Detaylı Teknik Analiz ve Gereksinim Dökümanı

## 1. Proje Özeti
Android platformunda çalışacak, kullanıcıların günlük, haftalık veya özel periyotlarla rutinlerini takip etmesini sağlayan, modern ve premium arayüze sahip bir "Ritim ve Rutin Hatırlatıcı" uygulamasıdır.

## 2. Teknoloji Yığını (Tech Stack)
Uygulama, sürdürülebilirlik, performans ve UI gereksinimleri gözetilerek aşağıdaki teknolojilerle geliştirilmiştir:
*   **Framework:** Angular 19 (Standalone Components yapısı ile) ✅
*   **Dil:** TypeScript 5+ ✅
*   **UI Kütüphanesi:** Bootstrap 5 (Responsive Grid ve Utility classlar için) ✅
*   **İkon Seti:** Bootstrap Icons ✅
*   **Mobil Paketleme:** Capacitor (Android build için) ✅
*   **Veri Saklama:** LocalStorage (Signals ile reaktif state yönetimi) ✅
*   **Takvim:** FullCalendar (Angular entegrasyonu) ✅
*   **Bildirimler:** Capacitor Local Notifications Plugin (Gelişmiş tekrarlama mantığı ile) ✅
*   **Reklam:** Google AdMob (Capacitor Community AdMob Plugin) ✅
*   **Grafikler:** Chart.js (Başarı ve istatistik takibi için) ✅

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
  
  startDate: string;       // Başlangıç tarihi (ISO)
  endDate?: string;        // Bitiş tarihi (Opsiyonel)
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
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
```

## 4. Uygulama Mimarisi ve Ekranlar

### 4.1. Genel Tasarım ve Markalama ✅
*   **İsim:** Uygulama adı "Ritmo" olarak tescillendi.
*   **İkon:** Özel tasarım "✓ Checkmark + Ritim Dalgaları" konseptli modern ikon.
*   **Splash Screen:** Uygulama açılışında marka kimliğini yansıtan premium açılış ekranı.
*   **Tema:** Açık ve Koyu (Dark) mod desteği dinamik olarak çalışır.
*   **Animasyonlar:** Premium mikro etkileşimler (Fade-in-up, Staggered listeler, Buton küçülme efektleri).

### 4.2. Header & Footer ✅
*   **Header:** Uygulama ismi (Ritmo) ve reklam alanı.
*   **Footer (Bottom Navigation Bar):** 5 Sekmeli yapı:
    *   Ana Sayfa (Home)
    *   Takvim (Calendar)
    *   Başarı (Statistics) ✅ [YENİ]
    *   Rutinler (Routines)
    *   Hesap (Settings)

### 4.3. Başarı Paneli (Statistics Screen) ✅ [YENİ]
*   **Haftalık Performans:** Son 7 günün tamamlanma grafiği (Line Chart).
*   **Rutin Dağılımı:** Kategorilere/renklere göre rutin dağılımı (Doughnut Chart).
*   **İstatistik Kartları:** Toplam rutin ve toplam tamamlanma sayıları.
*   **En İstikrarlı Rutin:** En çok tamamlanan rutini öne çıkaran kupa ikonlu kart.

### 4.4. Çoklu Dil Desteği (i18n) ✅ [YENİ]
*   **TranslationService:** Signal tabanlı reaktif dil yönetimi.
*   **Diller:** Türkçe ve İngilizce tam destek. Ayarlar menüsünden anlık değişim.

## 5. Kritik İşlevler (Business Logic)

### 5.1. Gelişmiş Bildirim Yönetimi ✅
*   `NotificationService` tüm sıklık tiplerini destekler:
    *   **Her Gün:** Günlük periyodik bildirim.
    *   **Hafta İçi / Sonu:** Belirli gün grupları.
    *   **Seçili Günler:** Kullanıcının seçtiği belirli günler.
    *   **Aralıklı:** 2, 3 veya X günde bir bildirim (Sonraki 14 vaka planlanır).

## 6. Geliştirme Durumu

### ✅ Tamamlananlar (Phase 1 & 2)
- [x] Tüm Core Servisler (Storage, Notification, Translation)
- [x] Premium Animasyon Sistemi (CSS + Signals)
- [x] Karanlık Mod (Dark Mode) Tam Entegrasyon
- [x] İstatistik ve Rapor Ekranı (Chart.js)
- [x] Uygulama İkonu ve Splash Screen Tasarımı
- [x] Gelişmiş Bildirim Mantığı (Haftalık, Aralıklı vb.)
- [x] Çoklu Dil Desteği (TR/EN Switcher)
- [x] Tamamlama İşaretleme Özelliği
- [x] Takvim Ekranı (2 Görünüm: Liste + Aylık)

### 🚧 Gelecek Planları (Phase 3)
- [ ] Bulut Yedekleme (Google Drive / Firebase)
- [ ] Rutinleri PDF olarak dışa aktarma
- [ ] Sosyal paylaşım özelliği (Başarı grafiğini paylaş)
- [ ] Production AdMob ID geçişi

---
**Son Güncelleme:** 31 Ocak 2026, 21:58
**Versiyon:** 1.1.0
