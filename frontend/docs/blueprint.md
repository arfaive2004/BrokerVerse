# **App Name**: BrokerVerse

## Core Features:

- New User Onboarding: Onboard new users by sending PAN, Aadhaar, and selfie to the KYC API (http://127.0.0.1:5000/api/kyc/onboard). Display results in a styled modal with 3D glowing border.
- Funds Check: Check client funds by calling the funds API (http://127.0.0.1:5000/api/compliance/check-funds) and display results as an interactive 3D balance card.
- Margin Report: Generate a margin report from the daily trade log via the API (http://127.0.0.1:5000/api/reports/generate-margin-report) and present it as an interactive 3D data table.
- Dashboard Metrics: Display key metrics like Total Brokerage, Active Clients, New Clients, and Top 5 Clients as 3D cards on the dashboard.
- Compliance Header: Provide the main compliance section modules in the main website navigation.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to evoke professionalism and trustworthiness.
- Background color: Light gray (#F2F0F7) to create a clean and modern look.
- Accent color: Soft lavender (#D0BCFF) to highlight interactive elements and add a touch of sophistication.
- Font pairing: 'Space Grotesk' (sans-serif) for headers and 'Inter' (sans-serif) for body, creating a balance between modern and readable.
- Use sleek, minimalist vector icons that complement the 3D aesthetic.
- Implement a structured, card-based layout with 3D elements for a premium feel, utilizing shadcn/ui components.
- Use subtle, modern animations powered by Framer Motion to enhance user interaction without being distracting.