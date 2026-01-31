# Ritmo – Development Guide & Quick Reference

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
# Browser: http://localhost:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

### Android APK
```bash
npm run build
npx cap sync
npx cap open android
# Build → Build APK in Android Studio
```

---

## 📁 Project Structure

```
src/
├── core/               # Game logic (13 files)
│   ├── SceneManager.js        # Three.js scene setup
│   ├── CameraManager.js       # Camera follow & lerp
│   ├── Player.js              # Player controls & physics
│   ├── GameLoop.js            # Main update loop
│   ├── ObstacleFactory.js     # Object pooling for rings
│   ├── CollisionSystem.js     # AABB collision detection
│   ├── GameState.js           # Score, combo, progression
│   ├── BonusSystem.js         # Powerups & gems
│   ├── DifficultyManager.js   # Progressive difficulty
│   ├── ThemeManager.js        # Biome transitions
│   ├── StorageManager.js      # LocalStorage manager
│   ├── DailyTaskManager.js    # LiveOps tasks
│   ├── AudioManager.js        # Web Audio API
│   └── HapticManager.js       # Vibration feedback
├── ui/                 # UI components (3 files)
│   ├── Menu.js                # Main menu
│   ├── HUD.js                 # In-game UI
│   └── GameOver.js            # Game over screen
├── main.js             # Entry point
└── style.css           # Responsive CSS
```

---

## 🎮 Implemented Features

### ✅ Core Gameplay
- [x] Endless falling mechanic
- [x] Swipe controls (relative movement)
- [x] Ring obstacles (object pooling)
- [x] AABB collision detection
- [x] Perfect Pass system (center bonus)
- [x] Combo multiplier (exponential scoring)
- [x] Difficulty progression (every 10 rings)

### ✅ Power-ups & Collectibles
- [x] Slow Motion (3s)
- [x] Shield (1 hit protection)
- [x] Magnet (5s, attracts gems)
- [x] Gems (shop currency)
- [x] Spawn rates: 10% powerups, 5% gems

### ✅ Visual & Polish
- [x] Biome transitions (Sky → Space → Void)
- [x] Theme system (Minimal, Neon, Kids)
- [x] Fog & lighting changes
- [x] Audio feedback (Web Audio API)
- [x] Haptic feedback (vibration)

### ✅ Meta-Progression
- [x] High score tracking
- [x] Persistent gem storage
- [x] Stats tracking (games played, rings passed, etc.)
- [x] Daily Tasks (3 random tasks/day)
- [x] Task types: Score, Rings, Gems, Perfect, Combo, Games

### ✅ UI/UX
- [x] Responsive design (mobile-first)
- [x] Touch-friendly (44x44px min targets)
- [x] Safe area support (notched devices)
- [x] Menu, HUD, GameOver screens
- [x] CSS variables for scalability

---

## 🔧 Technical Details

### Performance Optimizations
- Object pooling (20 rings)
- No physics engine (pure math)
- PixelRatio clamped to 2
- Single scene architecture
- Efficient AABB collision

### Mobile Optimization
```javascript
// Renderer setup
powerPreference: "high-performance"
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

### Storage (Base64 Encoded)
```javascript
localStorage.setItem('endless_drop_data', btoa(JSON.stringify(data)));
```

### Responsive CSS Variables
```css
--font-size-h1: clamp(32px, 8vw, 56px);
--btn-padding: clamp(12px, 3vw, 20px) clamp(30px, 6vw, 60px);
```

---

## 📊 Game State Flow

```
MENU → startGame() → PLAYING → collision → doGameOver() → GAME_OVER
  ↑                                                            ↓
  └─────────────────── restartGame() / showMenu() ────────────┘
```

---

## 🎯 Daily Tasks System

**Task Pool:**
- Score 500/1000
- Pass 20/50 rings
- Collect 10 gems
- 5/10 perfect passes
- Play 3 games
- 5x combo

**Reset:** Midnight (00:00)
**Reward:** Gems for shop

---

## 🔊 Audio Events

| Event | Sound | Haptic |
|-------|-------|--------|
| Perfect Pass | High beep (880Hz) | Medium |
| Normal Pass | Mid beep (440Hz) | - |
| Gem Collect | High beep (660Hz) | Light |
| Powerup | Very high (1200Hz) | Medium |
| Crash | Low buzz (110Hz) | Error pattern |
| Shield Save | Powerup sound | Light |

---

## 📱 Supported Devices

- ✅ iPhone SE (375px) → iPad Pro (1024px)
- ✅ Portrait & Landscape
- ✅ Notched devices (iPhone X+)
- ✅ Android (all sizes)

---

## 🚧 Optional/Future Features

- [ ] AdMob integration
- [ ] Shop UI (buy skins/trails with gems)
- [ ] Daily Tasks popup UI
- [ ] GLB model loading (rings use TorusGeometry)
- [ ] Particle effects
- [ ] Background music
- [ ] Social features (leaderboard)

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "three": "latest",
    "@capacitor/core": "latest",
    "@capacitor/android": "latest",
    "@capacitor/haptics": "latest"
  },
  "devDependencies": {
    "vite": "latest"
  }
}
```

---

## 🎓 Code Quality Rules

1. **Clean Code:** Self-documenting, single responsibility
2. **Modular:** Each manager handles one concern
3. **No Global State:** Dependency injection
4. **Mobile-First:** Always consider performance
5. **Responsive:** Use CSS variables, not hardcoded values

---

## 🐛 Common Issues & Solutions

**Issue:** Black screen on mobile
**Fix:** Check console, ensure audio context resumed on first touch

**Issue:** Controls not working
**Fix:** Verify `touch-action: none` in CSS

**Issue:** APK crashes
**Fix:** Check Android logcat, ensure Capacitor sync

**Issue:** Text too small on tablet
**Fix:** CSS variables auto-scale with `clamp()`

---

## 📄 License

MIT (Three.js compatible)

---

**Current Status:** ✅ READY FOR TESTING  
**Completion:** 95% (Core game complete, optional features pending)
