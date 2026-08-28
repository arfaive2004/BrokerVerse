# BrokerVerse — Frontend (Next.js)

The BrokerVerse UI: a dashboard, KYC onboarding form, funds checker, margin
report table, and trade-surveillance page, all talking to the BrokerVerse
backend API.

## Behavior

- **No login required** to view the dashboard — it always shows live demo
  metrics and demo top clients from the backend.
- **Sign in / Sign up** to unlock the compliance tools (Onboarding, Funds
  Checker, Margin Report, Trade Watchdog). Any client you onboard is tied to
  your account and immediately reflected in the dashboard metrics, top
  clients list, and KYC-expiry notifications.

## Local development

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Make sure the backend is running (see `../backend/README.md`) at the URL you
put in `NEXT_PUBLIC_API_URL`.

## Deploying to Vercel

1. Push this `frontend/` folder as its own Vercel project.
2. Set the environment variable `NEXT_PUBLIC_API_URL` to your deployed
   backend's URL (e.g. `https://brokerverse-backend.vercel.app`).
3. Deploy — `vercel.json` and `next.config.ts` are already set up for it.

## Notes

- **Theme**: dark navy background (`#0B132B`), slate-blue cards and
  navigation (`#1E293B`), electric blue primary actions (`#3B82F6`), with
  green/red reserved for market-direction signals (Up/Down status, PASS/FAIL,
  margin OK/issue) rather than reused elsewhere. Fonts and 3D card hover
  effects are unchanged from the original design. All colors are defined as
  CSS variables in `src/app/globals.css` — change them there to retheme the
  whole app.
- Bank statement CSVs for the Funds Checker should have columns like
  `date,description,credit,debit` (or `amount,type`).
