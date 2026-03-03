# Ritmo — Changelog

---

## [1.2.1] — 2026-03-04

### 🎨 Takvim HOURLY Görünüm İyileştirmeleri

#### Aylık Takvim (FullCalendar)
- HOURLY rutinler artık her occurrence için ayrı ayrı event oluşturmak yerine **günlük tek event** olarak gösterilir.
- Event başlığı `Rutin Adı X/Y` formatında günlük tamamlanma sayacı içerir.
- Renk mantığı: tümü tamamlandıysa 🟢 yeşil, kısmen tamamlandıysa rutin rengi, hiç tamamlanmadıysa rutin rengi (soluk).

#### Günlük Liste
- HOURLY rutin kartları **progress bar** formatına getirildi:
  - Üst renkli şerit, aktif saat penceresi badge'i, interval bilgisi.
  - Tamamlanma yüzdesi progress bar ile gösterilir.
  - "Tamamlamak için dokun" ipucu eklendi.
- Normal rutin kartları değişmedi (sıfır regresyon).

#### HOURLY Occurrence Tamamlama Modalı (YENİ)
- Günlük listede HOURLY rutin kartına tıklayınca **occurrence listesi modalı** açılır.
- Modalda o günün tüm saat/dakika slotları listelenir:
  - ✅ **Bitti** — tamamlanan slotlar (yeşil, üzeri çizili)
  - — **Atlandı** — geçmiş ama tamamlanmamış slotlar (sarı)
  - ⏳ **Bekliyor** — henüz gelmemiş slotlar (soluk)
- Her slot tıklanabilir → **tamamla / geri al toggle** (Atlandı ↔ Bitti).
- Modal tepesinde progress bar ve X/Y sayacı gösterilir.
- **Reaktif güncelleme:** `selectedHourlyRoutine` artık `computed()` ile storage'dan okunur; her tıklamada modal anlık güncellenir (stale state sorunu giderildi).

#### UX Düzeltmeleri
- Add Routine Modal'ına `modal-dialog-scrollable` + `padding-bottom: 75px` eklendi → bottom nav bar artık Kaydet butonunu gizlemiyor.
- İptal/Kaydet butonları `modal-footer`'a taşındı → scroll edilebilir bölgeden bağımsız, her zaman görünür.

---

## [1.2.0] — 2026-03-04

### 🆕 Yeni Özellik: Saatlik / Dakikalık Rutin Tipi (`HOURLY`)

Kullanıcılar artık belirli saat aralığında periyodik olarak tekrarlayan rutinler kurabilir.

#### Veri Modeli (`routine.model.ts`)
- `FrequencyType` tipine `'HOURLY'` değeri eklendi.
- Yeni opsiyonel alanlar: `intervalUnit`, `intervalValue`, `activeHoursStart`, `activeHoursEnd`.
- `completionHistory` geriye dönük uyumlu şekilde genişletildi: HOURLY rutinlerin her occurrence'ı `YYYY-MM-DDTHH:mm` formatında saklanır.

#### Paylaşılan Utility (`core/utils/routine.utils.ts`) — YENİ DOSYA
- `getOccurrenceTimesForDay()` — gün için tüm zamanları hesaplar
- `getCompletedOccurrencesForDate()` — tamamlananları filtreler
- `getCurrentOccurrence()` — şu anki occurrence'ı döndürür
- `getNextOccurrence()` — bir sonraki zamanı döndürür
- `getHourlyProgress()` — tamamlanma ilerlemesi
- `isCurrentOccurrenceCompleted()` — mevcut occurrence tamamlandı mı
- `getHourlyLabel()` — frekans etiketi (Rutin Listesi için)

#### Bildirim Servisi (`notification.service.ts`)
- `HOURLY` case eklendi: `buildHourlyNotifications()` ile aktif saat aralığında tüm occurrence'lar planlanır.
- Android güvenlik limiti: `MAX_NOTIFICATIONS_PER_HOURLY_ROUTINE = 100`. Kısa intervallar için dinamik gün planlaması.
- Her günün sonuna "Rutin Oturumu Tamamlandı 🎉" özet bildirimi eklendi.
- `refreshHourlyRoutines()` metodu eklendi — uygulama açılışında tükenen bildirimleri yeniler.
- `cancelRoutine()` HOURLY type için genişletildi.

#### Rutin Ekleme Modalı
- Frequency listesine `HOURLY` seçeneği eklendi.
- Yeni form alanları: Saat/Dakika birim toggle'ı, seçim butonları (Saat: 1–12; Dakika: 10, 20, 30, 40, 50), aktif saat aralığı (başlangıç/bitiş saati).
- HOURLY seçilince "Saat" input'u gizlenerek yerine aktif saat aralığı gösterilir.
- Form submit'te `time` alanı `activeHoursStart` ile senkronize edilir.

#### Ana Sayfa (`home.component`)
- HOURLY rutinler için ayrı kart tasarımı: progress bar, aktif pencere badge, sonraki occurrence bilgisi, "Tamamla" butonu.
- Üç durum gösterimi: Pencere öncesi (bekliyor), pencere içi (tamamla/bitti), pencere sonrası (oturum tamamlandı 🎉).
- `refreshHourlyRoutines()` ngOnInit'te çağrılıyor.
- Normal rutin kartları tamamen korundu — sıfır regresyon.

#### Takvim Ekranı (`calendar.component`)
- HOURLY rutin `isRoutineDue` desteklendi (her gün aktif).
- `loadEvents` HOURLY rutinler için her occurrence'ı ayrı takvim eventi olarak üretir.

#### Rutin Listesi (`routine-list.component`)
- `getFrequencyLabel()` metoduna `HOURLY` case eklendi (saat/dakika ve aktif pencere gösterimi).

#### Çeviriler (`translation.service.ts`)
- 18 yeni TR/EN anahtar eklendi: `HOURLY`, `INTERVAL_UNIT`, `HOURS`, `MINUTES`, `INTERVAL_VALUE_HOURS`, `INTERVAL_VALUE_MINUTES`, `ACTIVE_HOURS_RANGE`, `ACTIVE_HOURS_START`, `ACTIVE_HOURS_END`, `EVERY_X_HOURS`, `EVERY_X_MINUTES`, `NEXT_OCCURRENCE`, `PERIOD_COMPLETED_TODAY`, `HOURLY_COMPLETE_BTN`, `HOURLY_PROGRESS`, `ACTIVE_WINDOW`, `WAITING_NEXT`.

---

## [1.1.0] — 2026-01-31

### Tamamlananlar (Phase 2)
- Karanlık Mod tam entegrasyon
- İstatistik ve Rapor Ekranı (Chart.js)
- Uygulama İkonu ve Splash Screen
- Gelişmiş Bildirim Mantığı (WEEKDAYS, WEEKENDS, SPECIFIC_DAYS, INTERVAL)
- Çoklu Dil Desteği (TR/EN)
- Tamamlama İşaretleme
- Takvim Ekranı (Günlük Liste + Aylık FullCalendar)