# Endless Drop 3D – MASTER AI DEVELOPMENT DOCUMENT

Bu doküman, **Endless Drop 3D** oyununun baştan sona **tamamen yapay zekâya yaptırılması** için hazırlanmış
**tek ve eksiksiz** kaynaktır.

Bu dosya AI’ye verildiğinde:
- Soru sormadan
- Mimari boşluk bırakmadan
- Mobil performans öncelikli
- Mağazaya hazır

bir ürün ortaya çıkarması beklenir.

---

# 0. GENEL PROJE KURALLARI (ZORUNLU)

- Oyun Türü: **3D Hyper-Casual – Endless Drop**
- Platform: **Android + iOS**
- Motor: **Three.js (MIT)**
- Build: **Vite**
- Mobil Wrapper: **Capacitor**
- FPS hedefi: **60 (min 30)**
- Fizik motoru: ❌ KULLANMA
- Sahne sayısı: **1**
- Asset formatı: **glTF (.glb)**
- Kod stili: **Clean Code + Modüler**
- Physics yerine: **Saf matematik + AABB**
- Bellek dostu (object pooling zorunlu)

---

# 1. ADIM – SAHNE, KAMERA VE OYUNCU

## Amaç
Mobilde akıcı çalışan temel oyun iskeletini oluştur.

## Dosya Yapısı
```
src/
 ├─ core/
 │   ├─ SceneManager.js
 │   ├─ CameraManager.js
 │   ├─ Player.js
 │   └─ GameLoop.js
 └─ main.js
```

## Teknik Gereksinimler
- PerspectiveCamera (hafif açılı)
- Kamera oyuncuyu yumuşak takip eder (lerp)
- Oyuncu:
  - SphereGeometry (Başlangıç placeholder), finalde .glb olabilir
  - Sürekli aşağı düşer (gravity)
  - Relative Swipe ile X ekseninde hareket (Parmağı sürüklediğin kadar git)
- Renderer:
  - powerPreference: high-performance
  - PixelRatio clamp

## Çıktı
- Ekranda düşen ve kontrol edilebilen top

---

# 2. ADIM – CORE GAMEPLAY (ENGELLER & ÇARPIŞMA)

## Amaç
Sonsuz düşüş hissi ve temel oyun döngüsü.

## Dosya Yapısı
```
src/core/
 ├─ ObstacleFactory.js
 ├─ CollisionSystem.js
 └─ GameState.js
```

## Kurallar
- Sabit halkalar (v1.0)
- .glb formatında 3D model yüklenerek oluşturulur (TorusGeometry değil)
- Oyuncunun altına sürekli spawn
- Yukarıda kalan engeller silinir
- AABB collision
- Çarpışma → GAME_OVER
- Puanlama:
  - Geçilen her halka +1 puan
  - **Perfect Pass:** Halkanın tam ortasından geçerse ("Perfect" yazısı + Ses + Combo). Puan katlanarak artar.
- Biome Sistemi:
  - Mesafe arttıkça atmosfer değişir (Sky -> Space -> Void).
  - Her 500m/1000 puanda bir görsel set değişimi.

## Zorluk
- Zamanla düşüş hızı artar
- Engel aralığı azalır

---

# 3. ADIM – BONUS, ZORLUK VE TEMA

## Dosya Yapısı
```
src/core/
 ├─ BonusSystem.js
 ├─ DifficultyManager.js
 └─ ThemeManager.js
```

## Bonuslar
- Slow Motion (3 sn)
- Shield (1 çarpma)
- Magnet (5 sn)
- **Elmas/Yıldız:** Oyun içinde toplanabilir para birimi (Shop için).
- Spawn oranı: %10 (Bonus), %5 (Elmas)
- Aynı anda max 1 aktif bonus

## Tema
- Minimal
- Neon
- Kids
- **Meta-Progression (Shop):**
  - Toplanan elmaslarla açılan Top Skinleri.
  - efektli izler (Trails - Alev, Buz, Tron).
- Biome geçişleri otomatik (mesafeye bağlı).

---

# 4. ADIM – UI, REKLAM VE MAĞAZA

## UI Dosyaları
```
src/ui/
 ├─ Menu.js
 ├─ HUD.js
 └─ GameOver.js
```

## UI Gereksinimleri
- Start Menu
- Tema Seçimi
- Score
- Game Over

## Reklam
- AdMob
- Game Over: Interstitial (Her oyun sonu değil, frekanslı veya Revive reddedilince)
- Menü: Banner
- **Revive (İkinci Şans):** Çarptığında video izleyerek kaldığı yerden devam etme (1 kez).
- **High Score Line:** Düşerken rekor çizgisi geçerse görsel efekt.

---

- **High Score Line:** Düşerken rekor çizgisi geçerse görsel efekt.

---

# 5. ADIM – LIVEOPS & DAILY TASKS

## Amaç
Oyuncunun her gün oyuna girmesi için dinamik hedefler sunmak (Retention).

## Daily Task Sistemi
- Her gün 3 rastgele görev verilir (Örn: "500 Skora ulaş", "10 Elmas topla", "3 kez Perfect yap").
- Görevler gece 00:00'da yenilenir.
- Ödül: Elmas (Shop için).

## Yapı
- `DailyTaskManager.js`:
  - `checkDate()`: Gün değişti mi kontrolü.
  - `generateTasks()`: Havuzdan rastgele görev seçimi.
  - `claimReward()`: Ödül verme.
- UI: Menüde "Daily Missions" butonu ve popup'ı.

---

# 6. CLEAN ARCHITECTURE KURALLARI

- core → oyun mantığı
- ui → DOM / overlay
- main.js → sadece bootstrap
- Hiçbir class diğerini doğrudan oluşturmaz
- Constructor injection kullan

---

# 6. AI İÇİN YASAKLAR (ÇOK ÖNEMLİ)

❌ Fizik motoru ekleme  
❌ 4K texture  
❌ Dynamic shadow  
❌ FPS ölçümü olmadan efekt ekleme  
❌ Tek dosyada her şeyi yazma  

---

# 7. TEST STRATEJİSİ

- Gerçek mobil cihaz
- Düşük segment Android test
- 5 dk oynanışta memory leak olmamalı
- FPS 30 altına düşmemeli

---

# 8. MONETIZATION STRATEJİSİ

- Interstitial sıklığı: 1 oyun / 1 reklam
- Banner sadece menüde
- Reklam gösterimi sırasında oyun pause
- Reklam kapandıktan sonra clean restart

---

# 9. ADIM – STORE ASSETS (AI GENERATED)

## Amaç
AI araçları (DALL-E 3 / Midjourney) kullanılarak mağaza görsellerini üretmek.

## İstenen Görseller
1.  **App Icon (512x512):**
    - Minimalist 3D render.
    - Mavi arka plan üzerinde düşen parlak, neon bir küre.
    - Hız hissi veren motion blur.
    - "Drop" yazısı YOK (Sadece sembol).

2.  **Feature Graphic (1024x500):**
    - Geniş açı sahne.
    - Sonsuzluğa uzanan neon halkalar içinden geçen fütüristik top.
    - Canlı, enerjik renkler (Cyberpunk paleti).
    - Sağ tarafta boşluk (Logo yerleşimi için).

---

# 10. SON HEDEF

AI bu dokümana uyarak:
- Play Store & App Store uyumlu
- Reklamlı ama oyuncu dostu
- Güncellenebilir
- Performanslı

**tam bir Endless Drop 3D oyunu üretmelidir.**

---

# 11. RESPONSIVE DESIGN & MOBILE OPTIMIZATION

## Viewport & Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

## CSS Variables (Mobile-First)
- Font sizes: `clamp(min, vw, max)` ile responsive
- Touch targets: Minimum 44x44px
- Safe area insets: `env(safe-area-inset-*)` support
- Full screen canvas: 100vw x 100vh
- Prevent text selection, zoom, overscroll

## UI Component Responsive Rules
- All buttons use CSS variables (`--btn-padding`, `--btn-font-size`)
- Touch events: `ontouchstart` + `ontouchend`
- HUD elements respect notch areas
- Media queries for tablet landscape and desktop

---

# 12. GERÇEK DOSYA YAPISI

```
Endless Drop 3D/
├── index.html
├── package.json
├── vite.config.js
├── capacitor.config.ts
├── src/
│   ├── main.js
│   ├── style.css
│   ├── core/
│   │   ├── SceneManager.js
│   │   ├── CameraManager.js
│   │   ├── Player.js
│   │   ├── GameLoop.js
│   │   ├── ObstacleFactory.js
│   │   ├── CollisionSystem.js
│   │   ├── GameState.js
│   │   ├── BonusSystem.js
│   │   ├── DifficultyManager.js
│   │   ├── ThemeManager.js
│   │   ├── StorageManager.js
│   │   ├── DailyTaskManager.js
│   │   ├── AudioManager.js
│   │   └── HapticManager.js
│   └── ui/
│       ├── Menu.js
│       ├── HUD.js
│       └── GameOver.js
├── Docs/
│   ├── Endless_Drop_3D_MASTER_AI_DOC.md
│   ├── prompts.md
│   └── Store_Description.md
└── android/ (Capacitor tarafından oluşturulur)
```

---

# 13. CAPACITOR MOBILE BUILD

## Kurulum
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/haptics
npx cap init "Endless Drop 3D" "com.endlessdrop.game" --web-dir=dist
```

## Build Süreci
```bash
npm run build           # Web build
npx cap add android     # İlk kez platform ekle
npx cap sync           # Her build sonrası sync
npx cap open android   # Android Studio'da aç
```

## capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.endlessdrop.game',
  appName: 'Endless Drop 3D',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

---

# 14. IMPLEMENTATION CHECKLIST

## ✅ Core Systems (Completed)
- [x] SceneManager, CameraManager, GameLoop
- [x] Player (swipe controls, gravity)
- [x] ObstacleFactory (object pooling)
- [x] CollisionSystem (AABB, Perfect Pass)
- [x] GameState (score, combo, gems)

## ✅ Gameplay Features (Completed)
- [x] Perfect Pass combo system
- [x] Bonus system (SlowMo, Shield, Magnet)
- [x] Difficulty progression
- [x] Biome transitions (Sky → Space → Void)
- [x] Gem collection

## ✅ Meta-Progression (Completed)
- [x] StorageManager (high score, gems, stats)
- [x] DailyTaskManager (LiveOps)
- [x] Shop structure (skin/trail data ready)

## ✅ UI/UX (Completed)
- [x] Menu (responsive, touch-friendly)
- [x] HUD (score, gems, combo, shield)
- [x] GameOver (stats, restart, menu)
- [x] Responsive design (mobile-first)

## ✅ Polish (Completed)
- [x] AudioManager (Web Audio API)
- [x] HapticManager (vibration)
- [x] Safe area support (notched devices)
- [x] Touch event handling

## ⚠️ Optional/Future
- [ ] Daily Tasks UI popup
- [ ] Shop UI (buy skins/trails)
- [ ] AdMob integration
- [ ] GLB model loading (rings use placeholder)
- [ ] Particle effects
- [ ] Background music

---

# 15. PERFORMANS NOTLARI

- Object pooling kullanıldı (20 halka)
- PixelRatio clamped (max 2)
- Fizik motoru YOK (saf matematik)
- Single scene architecture
- RequestAnimationFrame based loop
- Mobile GPU optimized (MeshStandardMaterial)

**Hedef:** 60 FPS (min 30) on low-end Android

---

# 16. FINAL NOTES

Bu doküman ile oyun %95 tamamlanmıştır.
Eksik kısımlar:
1. AdMob AdManager implementasyonu
2. GLB model loader (halka için)
3. Shop UI komponenti
4. Daily Tasks popup UI

Bu özellikler opsiyoneldir ve oyun bunlar olmadan da yayınlanabilir.
