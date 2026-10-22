# 🌿 BreatheFlow — Pranayama Breathing Timer

> A modern, mindful web application designed to guide your pranayama and breathwork sessions with gentle audio cues, smooth animations, and customizable breathing rhythms.

![BreatheFlow Screenshot](public/icons.svg)

---

## ✨ Features

- **🧘 Preset Breathing Patterns**:
  - **Box Breathing (Sama Vritti)**: 4s Inhale, 4s Hold, 4s Exhale, 4s Hold
  - **4-7-8 Relaxing Breath**: 4s Inhale, 7s Hold, 8s Exhale
  - **Equal Breathing**: 4s Inhale, 4s Exhale
  - **Custom Pranayama**: Fully adjustable timings for Inhale, Inhale Hold, Exhale, and Exhale Hold
- **🎨 Visual Breathing Circle**: Smooth expanding and contracting animation with phase indicators and countdown timers.
- **🔊 Web Audio Chimes & Cues**:
  - Gentle synthesizer chimes for phase transitions (Inhale, Hold, Exhale)
  - 3-2-1 countdown preparation chime
  - Subtle rhythmic second ticks (can be toggled on/off)
  - Volume control and mute toggle
- **⏱️ Flexible Controls**:
  - Target by **Duration** (minutes) or **Cycle Count** (rounds)
  - Pause, Resume, and Stop with confirmation dialog
  - Session Summary report with total time, completed cycles, and calm quotes
- **📱 Responsive & Accessible**:
  - Clean, soothing emerald & sage green aesthetic
  - Optimized for desktop, tablets, and smartphones

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be created in the `dist` folder.

---

## 🌐 Hosting on Netlify

1. Build the app:
   ```bash
   npm run build
   ```
2. **Option A (Drag & Drop)**: Drop the `dist` folder directly onto [Netlify Drop](https://app.netlify.com/drop).
3. **Option B (GitHub Continuous Deployment)**:
   - Link this repository to Netlify.
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   *(Pre-configured via `netlify.toml`)*
