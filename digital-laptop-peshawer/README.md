# DIGITAL LAPTOP Peshawar — DLS Store

Premium laptop storefront + full admin panel. Built with Next.js 16 (App Router), Drizzle ORM, PostgreSQL (Neon), Tailwind CSS v4.

## 🚀 Deploy to Vercel

1. Push this folder to GitHub.
2. On Vercel → **Add New Project** → import the repo.
3. Add the environment variables (below) in **Project → Settings → Environment Variables**.
4. Deploy. Then open `https://your-app.vercel.app/admin` and log in with your admin password.

## 🔑 Environment Variables (set on Vercel)

| Variable                | Required    | Description                                                                        |
| ----------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`          | ✅ Yes      | Neon/Postgres connection string                                                    |
| `ADMIN_PASSWORD`        | ✅ Yes      | Admin login password (change after first login via Admin → Settings)               |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Your Cloudinary cloud name                                                         |
| `CLOUDINARY_API_KEY`    | For uploads | Cloudinary API key                                                                 |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret                                                              |
| `NEXT_PUBLIC_SITE_URL`  | Optional    | e.g. `https://digital-laptop-peshawer.vercel.app` — used in WhatsApp product links |

> Alternative: set a single `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME` instead of the three vars.
> Cloudinary credentials: dashboard → **Settings** → **API Keys**.

## 🧑‍💼 Admin Panel (`/admin`)

| Tab            | What you can do                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| **Dashboard**  | Sales stats, revenue, low-stock alerts, recent orders                                                         |
| **Products**   | List, edit, feature ⭐, delete products                                                                       |
| **Add Laptop** | Add new products — **upload images straight to Cloudinary**, or paste an image URL                            |
| **Orders**     | See all orders, change status (Pending → Confirmed → Delivered / Cancelled), forward order to shop WhatsApp   |
| **Settings**   | Full site control — hero text, badges, service section, images, contact info, phone/WhatsApp, password change |

### Settings control everything on the storefront:

- 🔝 Badge "Alharmian Market · Near Gull Haji Plaza · Peshawar"
- 🖼️ Hero image + floating badges ("Core i5 – Ultra 9", "DLS Service Lab")
- 🔧 Service section (title, description, image, book-a-service phone)
- 📞 Phone, WhatsApp, address, map, opening hours, footer

### Change admin password

**Admin → Settings → Security** — enter current + new password. You'll be logged out and must sign in again.

## 🛒 Customer order tracking

- Customers can track their order at **`/track`** using:
  - the order number (`DL-0012`), **or**
  - their phone number (`0310-9516681` / `+923109516681`)
- After placing an order, the confirmation page links straight to tracking.

## 🖼️ Images

- `public/images/` contains lightweight SVG placeholders used as defaults.
- Real product photos are uploaded via Cloudinary from the admin panel (signed uploads, secret stays server-side).
- You can also paste any image URL directly in the admin form.

## 📝 Local development

```bash
npm install
cp .env.example .env.local   # add DATABASE_URL, ADMIN_PASSWORD, Cloudinary keys
npm run db:push              # create tables (or use drizzle-kit push)
npm run seed                 # optional: seed sample products
npm run dev
```
