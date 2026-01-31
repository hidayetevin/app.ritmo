# Endless Drop 3D – Analiz & Tasarım Dokümanı (v0.1)

## 1. Platform & Teknoloji
- Android + iOS
- Three.js (MIT)
- Vite
- Capacitor
- AdMob
- glTF (.glb)

## 2. Hedef Oyun Profili
- 3D Hyper-Casual
- Sonsuz düşüş
- Tek parmak kontrol
- 30–90 sn oturum süresi

## 3. Core Gameplay Loop
Start → Tema Seçimi → Countdown → Düşüş & Kaçınma → Hız Artışı → Çarpma → Game Over → Reklam → Restart

## 4. Kontrol
- Varsayılan: Swipe
- Opsiyonel: Tilt

## 5. Zorluk Eğrisi
- 0–10 sn: Yavaş, sabit halkalar
- 10–30 sn: Orta hız
- 30–60 sn: Hızlı, karma
- 60+ sn: Çok hızlı

## 6. Engeller
- v1.0: Sabit halkalar
- v1.1+: Dönen, kapanan, kırılabilir

## 7. Bonus Sistemi
- Slow Motion (3 sn)
- Shield (1 çarpma)
- Magnet (5 sn)
- Spawn oranı: %10

## 8. Tema Sistemi
- Minimal
- Neon
- Renkli / Kids
(Tema menüden seçilir)

## 9. Kamera
- Hafif açılı (15–20°)
- Y ekseni takip
- Smooth lerp

## 10. Ses
- CC0 sesler
- jsfxr ile üretim

## 11. Reklam
- Game Over: Interstitial
- Menü: Banner
- Devam hakkı yok

## 12. Performans & Mimari
- Hedef FPS: 60
- InstancedMesh
- Object Pooling
- Tek scene
- Physics yok (AABB)

### Önerilen Mimari
```
core/
 ├─ GameLoop
 ├─ StateManager
 ├─ InputManager
 ├─ ThemeManager
 ├─ ObstacleFactory
 └─ BonusSystem
```

## 13. Riskler
- FPS düşüşü → Instancing
- Reklam lag → Scene pause
- iOS limit → Düşük texture
