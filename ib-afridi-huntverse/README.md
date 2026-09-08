# IB AFRIDI HUNTVERSE

Pakistan's ethical bug bounty arena for authorized security research.

## Prototype features

- Fullscreen terminal boot intro with Matrix rain and skull mark
- Hunter dashboard with IB Afridi rank, PKR bounty wallet, systems secured, IAPF recon terminal, target programs, submissions, and KPK leaderboard
- Company target panel with B'Best Cafe scope, P1-P4 bounty table, triage inbox, subscription, and payout overview
- IB Afridi God Mode triage panel with AI triage simulation, CVSS/OWASP context, SOC feed, and Pakistan activity map
- Public arena with live activity, Hall of Fame, secured company wall, and KPK leaderboard
- CVE database search UI, report builder, security settings, OTP/2FA and audit-log indicators
- P1 red alert glitch effect and safe recon command simulator
- PWA manifest and Capacitor configuration for APK packaging

## Run locally

Open `index.html` directly in a browser. No build step is needed for this prototype.

## Important safety boundary

The recon terminal is a visual prototype and does not scan real assets. Only test systems you own or have explicit written authorization to assess. Production requires a secure backend, authenticated scope enforcement, rate limits, audit logs, safe sandboxing, legal review, CVSS validation, and human triage.

## Production handoff

Connect a Next.js/Node.js API, PostgreSQL for programs/reports/users, Redis + Socket.io for live events, object storage for PoC files, OTP/2FA, JazzCash/Easypaisa payout integrations, and a curated CVE/OWASP knowledge service. Never ingest or redistribute proprietary books or private bounty reports without permission.

Founder: IB Afridi · Peshawar · ib.afridi.cs@gmail.com
