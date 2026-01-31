# Endless Drop 3D – AI Development Prompts (prompts.md)

Bu dosya, **Endless Drop 3D** oyununun baştan sona **yapay zekaya yaptırılması** için hazırlanmıştır.
AI bu dosyayı okuduğunda **hiç soru sormadan**, adım adım üretime geçebilmelidir.

---

## GENEL KURALLAR (AI İÇİN ZORUNLU)

- Oyun: **3D Hyper-Casual – Endless Drop**
- Platform: **Android + iOS**
- Teknoloji:
  - Three.js (MIT)
  - Vite
  - Capacitor
- Performans hedefi:
  - Mobilde **60 FPS**
- Fizik motoru **KULLANMA**
- Clean Code + Modüler Mimari
- Tek Scene yaklaşımı
- Asset formatı: **glTF (.glb)**

---

# ADIM 1 – SAHNE, KAMERA VE OYUNCU

## Amaç
- Three.js sahnesi kur
- Mobil uyumlu kamera oluştur
- Düşen oyuncu (küre) ekle

## Kullanılacak Araçlar
- Three.js
- Saf matematik (gravity)

## Dosya Yapısı
```
src/
 ├─ core/
 │   ├─ SceneManager.js
 │   ├─ CameraManager.js
 │   ├─ Player.js
 │   ├─ AudioManager.js
 │   └─ GameLoop.js
 └─ main.js
```

## Detaylar
- Kamera:
  - PerspectiveCamera
  - Hafif açılı
  - Oyuncuyu yumuşak takip eder (lerp)
- Oyuncu:
  - SphereGeometry (Placeholder)
  - Yerçekimi ile sürekli aşağı düşer
  - Relative Swipe (Joystick mantığı) ile X ekseninde hareket eder
- Renderer:
  - powerPreference: high-performance
  - Pixel ratio clamp

## Çıktı
- Ekranda düşen ve sağa–sol hareket eden bir top
- Mobil dokunma inputu çalışır durumda

---

# ADIM 2 – CORE GAMEPLAY (ENGELLER & ÇARPIŞMA)

## Amaç
- Sonsuz düşüş hissi
- Sabit halkalar üret
- Çarpışma ve Game Over

## Kullanılacak Yapılar
- Object Pooling
- Factory Pattern
- AABB Collision

## Dosya Yapısı
```
src/core/
 ├─ ObstacleFactory.js
 ├─ CollisionSystem.js
 └─ GameState.js
```

## Detaylar
- Halka:
  - GLTFLoader ile .glb model yükle (Profesyonel görünüm)
  - Ortası boş
- Üretim:
  - Oyuncunun altına doğru sürekli spawn
  - Yukarıda kalanlar silinir
- Puanlama:
  - Oyuncu halkanın içinden geçerse Score artar.
  - **Perfect Pass:** Tam ortadan geçiş ekstra puan ve combo sağlar.
- Biome:
  - Belirli skorlarda dünya teması değişir (Sky -> Space).
- Çarpışma:
  - Oyuncu halka ile temas ederse: Revive ekranı veya GAME_OVER.
- Zorluk:
  - Zamanla halka aralığı azalır
  - Düşüş hızı artar

## Çıktı
- Oyuncu halkalardan kaçıyor
- Çarpınca oyun bitiyor

---

# ADIM 3 – BONUS, ZORLUK VE TEMA SİSTEMİ

## Amaç
- Oyuna derinlik katmak
- Görsel tema seçimi

## Bonus Türleri
- Slow Motion (3 sn)
- Shield (1 çarpma affı)
- Magnet (bonus çekme)

## Dosya Yapısı
```
src/core/
 ├─ BonusSystem.js
 ├─ DifficultyManager.js
 └─ ThemeManager.js
```

## Detaylar
- Bonus spawn oranı: %10
- Aynı anda max 1 bonus aktif
- Tema:
  - Minimal
  - Neon
  - Kids
- Theme değişimi:
  - Biome sistemine göre otomatik renk/skybox değişimi.
- **Shop ve Meta:**
  - Toplanan 'Elmas' ile yeni Skin ve Trail (iz) açma.
- **Shop ve Meta:**
  - Toplanan 'Elmas' ile yeni Skin ve Trail (iz) açma.
  - **StorageManager:** Tüm verileri (Skor, Skin, Elmas) merkezi yönetir.

## Audio & Haptics
- **Ses:** `Howler.js` veya HTML5 Audio. Ambiyans müziği ve SFX.
- **Titreşim:** `navigator.vibrate` veya Capacitor Haptics.

## Çıktı
- Bonuslar çalışır
- Tema seçimi menüden yapılır
- Performans kaybı olmaz

---

- Performans kaybı olmaz

---

# ADIM 4.5 – LIVEOPS & DAILY TASKS

## Amaç
- Günlük aktif kullanıcı (DAU) sayısını artırmak.

## Detaylar
- **Görev Havuzu:**
  - "Score X points"
  - "Collect Y gems"
  - "Play Z games"
  - "Do N perfect passes"
- **Sistem:**
  - LocalStorage ile son giriş tarihi ve görev durumu tutulur.
  - UI üzerinde ilerleme çubuğu (Progress Bar) gösterilir.
  - Görev tamamlanınca "Claim" butonu aktif olur.

## Dosya Yapısı
```
src/core/
 └─ DailyTaskManager.js
src/ui/
 └─ DailyTasksPopup.js
```

---

# ADIM 5 – UI, REKLAM VE MAĞAZA HAZIRLIĞI

## Amaç
- Oyunu mağazaya hazır hale getirmek

## UI
- Start Menu
- Theme Select
- Game Over Screen
- Score Display

## Reklam
- AdMob
- Game Over → Interstitial (Revive izlenmezse)
- Menü → Banner
- **Revive Sistemi:** Video izle devam et.
- **High Score Line:** Rekor kırılma anı efekti.

## Mobil Paketleme
- Capacitor
- Android WebView
- iOS WKWebView

## Dosya Yapısı
```
src/ui/
 ├─ Menu.js
 ├─ HUD.js
 └─ GameOver.js
```

## Çıktı
- Reklamlı ama oyuncuyu boğmayan yapı
- Play Store & App Store uyumlu build

---

# ADIM 5 – GRAFİK TASARIM (AI GENERATION)

## Amaç
- Mağaza ikonunu ve kapak görselini AI ile oluşturmak.

## Promptlar
- **Icon:** "3D render of a glossy neon sphere falling through a futuristic ring, motion blur, blue and purple cyberpunk lighting, high quality, minimalist mobile app icon style, white background"
- **Feature Graphic:** "Wide shot of an endless tunnel of neon rings in space, a futuristic sphere diving down rapidly, dynamic angle, speed lines, 4k resolution, hyper-casual game art style"

## Çıktı
- `assets/icon.png`
- `assets/feature.png`


---

# SON HEDEF

AI bu dosyaya göre:
- Oyunu sıfırdan kurar
- Mobilde akıcı çalışır
- Reklam gelirine hazır olur

---

# ADIM 6 – RESPONSIVE DESIGN & MOBILE POLISH

## Amaç
- Tüm cihazlarda mükemmel görünüm
- Touch-friendly UI
- Safe area support (notch)

## CSS Variables
```css
:root {
  --font-size-h1: clamp(32px, 8vw, 56px);
  --font-size-score: clamp(24px, 5vw, 36px);
  --btn-padding: clamp(12px, 3vw, 20px) clamp(30px, 6vw, 60px);
}
```

## Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

## Touch Events
```javascript
button.ontouchstart = button.onmouseover = () => { /* scale */ };
button.ontouchend = button.onmouseout = () => { /* reset */ };
```

## Safe Area Insets
```css
top: max(20px, env(safe-area-inset-top, 20px) + 10px);
```

---

# ADIM 7 – CAPACITOR BUILD

## Build Commands
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

## Config
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.endlessdrop.game',
  appName: 'Endless Drop 3D',
  webDir: 'dist'
};
```

---

# IMPLEMENTATION SUMMARY

## ✅ Tamamlanan Sistemler
1. **Core:** Scene, Camera, Player, GameLoop
2. **Gameplay:** Obstacles, Collision, Perfect Pass
3. **Bonus:** SlowMo, Shield, Magnet, Gems
4. **Progression:** Difficulty, Biome, Score
5. **Storage:** LocalStorage (high score, gems, tasks)
6. **LiveOps:** Daily Tasks (3/day, auto-reset)
7. **UI:** Menu, HUD, GameOver (responsive)
8. **Audio:** Web Audio API beeps
9. **Haptics:** Vibration feedback
10. **Responsive:** Mobile-first, safe-area support

## 📦 Dosya Yapısı
```
src/
├── core/ (13 files)
│   ├── SceneManager.js
│   ├── Player.js
│   ├── CollisionSystem.js
│   ├── StorageManager.js
│   └── ... (9 more)
├── ui/ (3 files)
│   ├── Menu.js
│   ├── HUD.js
│   └── GameOver.js
└── main.js
```

## 🎯 Performans
- Object pooling ✅
- No physics engine ✅
- AABB collision ✅
- 60 FPS target ✅
- Mobile optimized ✅

---

# SON HEDEF

AI bu dosyaya göre:
- Oyunu sıfırdan kurar
- Mobilde akıcı çalışır
- Reklam gelirine hazır olur
- Güncellenebilir ve ölçeklenebilir bir yapı sunar

**Oyun %95 tamamlanmıştır.**
Eksikler (opsiyonel):
- AdMob entegrasyonu
- Shop UI
- Daily Tasks popup
- GLB model loader
