# KhyberVerse

KhyberVerse is a launch-ready frontend prototype for a city super app and business OS serving Bara and Peshawar.

## Included in this prototype

- Customer home experience with universal search and local discovery
- Food delivery with B'Best Cafe deals from Rs. 590 to Rs. 3,450
- Mart and grocery catalog
- Bike, car, and parcel booking flow
- Local marketplace for phones, property, and jobs
- Trusted home services and doctor-on-call discovery
- AI Hujra interaction in Pashto, Urdu, and English
- Vendor sales dashboard with commission visibility
- Rider earnings dashboard
- Admin city intelligence dashboard
- Wallet with PKR balance and transaction history
- Dark/light theme, responsive mobile drawer, and PWA manifest
- Capacitor configuration for Android packaging

## Open locally

Open `index.html` in a browser. No build step is required for the prototype.

## Production path

1. Move the UI into a Vite React app and split each panel into feature modules.
2. Add Node.js services for identity, catalog, orders, rides, wallet, messaging, and AI orchestration.
3. Use PostgreSQL for durable records, Redis for sessions and live availability, and Socket.io for tracking.
4. Add JazzCash/Easypaisa gateways, WhatsApp/SMS provider credentials, Google Maps keys, and object storage.
5. Run security review, audit logging, rate limiting, OTP authentication, backups, and role-scoped authorization before launch.

The current UI deliberately uses realistic local demo data and safe placeholders; it does not process real payments or make live ride/food bookings.
