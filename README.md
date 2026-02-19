# 水の呼吸 — Water Breathing · Connected

📱 Phone = Sword → 💻 Laptop = Battlefield. Slash your phone, watch slashes appear on the laptop screen in real-time.

## ⚡ Quick Setup

### Step 1 — Get a FREE Ably API Key (2 min)
1. Go to https://ably.com and sign up (free, no credit card)
2. Create an app → go to **API Keys**
3. Copy the key that looks like: `abc123.def456:xyz789...`

### Step 2 — Add your key
Create a `.env` file in the project root:
```
VITE_ABLY_KEY=your_actual_ably_key_here
```

### Step 3 — Run it
```bash
npm install
npm run dev
```

### Step 4 — Use it
1. **Laptop**: Open `http://localhost:5173` → choose **Battlefield** → note the Room ID
2. **Phone**: Open the same URL on your phone → choose **Sword** → enter the Room ID → tap Unsheathe
3. Slash your phone like a sword → slashes appear on laptop! 🗡️

---

## 🚀 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add your Ably key as an environment variable in Vercel dashboard:
- `VITE_ABLY_KEY` = your key

**Important:** Vercel env vars prefixed with `VITE_` are exposed to the frontend — this is correct and expected for Ably's public key format.

---

## Architecture

```
Phone (motion)  →  Ably Cloud  →  Laptop (renders)
     │                               │
DeviceMotion                   Canvas VFX
     │                         Screen Shake
  publish('slash', {           Enemy HP system
    angle, intensity,          Damage numbers
    x, y                       Ripples + particles
  })
```

## File Structure
```
src/
├── pages/
│   ├── Home.jsx        ← Room lobby, mode selection
│   ├── PhonePage.jsx   ← Sword UI, motion detection
│   └── LaptopPage.jsx  ← Battlefield, VFX, enemy
├── hooks/
│   └── useAbly.js      ← Shared real-time channel
├── main.jsx            ← Router
└── index.css           ← All animations
```

## Tuning

**Motion sensitivity** in `PhonePage.jsx`:
```js
if (intensity > 2.0)  // lower = more sensitive
```

**Enemy HP** in `LaptopPage.jsx`:
```js
const MAX_HP = 300  // increase for longer fights
```
