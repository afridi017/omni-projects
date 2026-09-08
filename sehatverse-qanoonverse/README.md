# SehatVerse & QanoonVerse

A polished frontend prototype for a health + justice operating system serving Bara, Peshawar, and KPK.

## Prototype panels

Patient, Doctor, Lab, Pharmacy, Hospital Admin, Rider, Lawyer, Government Health Inspector, Finance & Sehat Insaf Card, AI Brain, and Medical Record Vault.

## Included flows

- Pashto, Urdu, and English symptom entry
- Emergency ambulance CTA with Bara location context
- Doctor booking and video consultation queue
- CBC, blood sugar, X-ray, and ultrasound test booking
- AI report reader entry point with medical safety guardrails
- Pharmacy medicine search and salt-alternative comparison
- Live hospital beds for HMC and LRH
- Medicine/sample rider network
- Medical negligence case builder and lawyer review warning
- Health inspection risk board
- Finance, commission, and Sehat Insaf Card overview
- AI Hujra response that explains reports and legal next steps without claiming a diagnosis
- Dark mode, mobile sidebar, PWA manifest, and Capacitor configuration

## Open locally

Open `index.html` in a browser. No build step is required for this prototype.

## Production handoff

This frontend uses realistic demo data only. Before launch, connect:

- React/Vite feature modules and a Node.js API gateway
- PostgreSQL for patients, providers, records, bookings, and legal cases
- Redis + Socket.io for availability, ambulance tracking, and notifications
- Encrypted object storage for reports and prescriptions
- JazzCash, Easypaisa, Sehat Insaf Card, SMS/WhatsApp, and Maps providers
- OTP authentication, RBAC, audit logs, consent management, backups, rate limiting, and human review

AI must remain decision support: it must not diagnose cancer, prescribe medicine, or issue legal conclusions without licensed professional review.
