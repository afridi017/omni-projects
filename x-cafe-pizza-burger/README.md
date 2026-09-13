# 🍕 X Cafe Pizza and Burger House

**Budget Me Best Taste — Peshawar ka apna zaiqa.**

Premium single-page website for X Cafe Pizza and Burger House — Peshawar Ring Road's
budget fast-food cafe (Adeera Achini Payan). Dark modern design with orange `#FF6B00`
and red `#E11D48` accents, glassmorphism cards, bold Poppins typography, `rounded-2xl`
corners, fully responsive.

## ✨ Features

| Feature              | Details                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 🏠 Hero              | "Budget Me Best Taste" headline, floating pizza/burger emoji with glow, WhatsApp + Call CTAs         |
| 📊 Stats bar         | 2.8★ (148 reviews) · Rs 1–1,000/person · Takeout/Delivery · Opens 11 AM                              |
| 🍽️ Menu tabs         | Pizza, Burgers, Shawarma, Deals & Combos (BEST VALUE badges), Sides & Drinks — all real prices       |
| 🛒 Cart              | Add-to-cart with counter badge, slide-out cart drawer, quantity controls, live total                 |
| 💬 WhatsApp checkout | Pre-filled "Assalam-o-Alaikum X Cafe, mujhe order karna hai..." message with full cart breakdown     |
| 💛 About             | Story for students & families in Achini                                                              |
| ⭐ Reviews           | 3 real Google reviews (Muhammad Noor, Rameez Raja, HUZAIFA SARIM)                                    |
| 📍 Location          | Full address, Plus Code XFG9+3F, phone, embedded Google Map, Get Directions                          |
| 📱 Mobile bar        | Sticky bottom order bar on mobile                                                                    |
| 🔍 SEO               | "pizza burger Peshawar Ring Road" keywords, Open Graph, Twitter cards, schema.org Restaurant JSON-LD |

## 🚀 Run locally

```bash
npm install        # (only needed for the `serve` package)
npm start          # serves at http://localhost:3000
# or open index.html directly in a browser
```

## 🛠️ Dev scripts

```bash
npm run dev        # dev server on port 3000
npm run check:js   # syntax-check the inline JavaScript
```

## 📞 Business info (single source of truth)

- **Phone / WhatsApp:** `+92 337 1377555` (`923371377555` in `wa.me` links)
- **Address:** 30 Peshawar Ring Rd, Adeera Achini Payan, Peshawar — Plus Code `XFG9+3F`
- **Hours:** 11 AM – 3 AM, daily
- **Order message:** `Assalam-o-Alaikum X Cafe, mujhe order karna hai...`

## 🚀 Deploy

It's a single static HTML file — deploy anywhere:

- **Vercel:** drag the folder into [vercel.com](https://vercel.com) (framework: _Other_, build: none, output: current dir) → auto HTTPS + free hosting. Add a buildless config if needed.
- **Netlify:** drag & drop the folder site.
- **GitHub Pages:** push the repo, enable Pages on the branch.

Update `https://xcafe.pk/` in the `<head>` (canonical/OG URLs) to the real domain.

## 🧩 Structure

```
x-cafe-pizza-burger/
├── index.html      # entire site (HTML + CSS + JS, zero dependencies)
├── package.json    # dev/serve scripts
└── README.md
```

- Emoji used instead of images to stay fully offline/self-contained — swap for real
  food photography (e.g. Cloudinary) in the hero/about tiles for extra polish.
- All regional prices use `en-PK` locale formatting (e.g. `1,000`).
