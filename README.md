# BrokerVerse

> An AI-assisted brokerage operations platform for client onboarding, KYC verification, fund monitoring, margin analysis, and trade surveillance.

## Overview

BrokerVerse is a full-stack brokerage operations platform designed to simulate and modernize several workflows performed by brokerage firms and financial intermediaries.

The project provides a centralized system where users can:

- Create and manage their own brokerage workspace
- Onboard clients
- Perform AI-assisted KYC verification
- Upload identity documents
- Compare a live selfie with the photograph on a government identity document
- Track client funds
- Monitor margins
- Generate margin reports
- Identify potential trade-related issues
- Track KYC expiry dates
- View dashboards and operational analytics

The application initially provides demonstration data for exploring the platform. However, once a user creates an account and logs in, the application is designed to work as a separate workspace.

Each authenticated user can onboard their own clients and generate their own operational data.

---

# Why BrokerVerse?

Traditional brokerage operations involve multiple processes that are often handled across different systems.

Some of these include:

- Client onboarding
- Know Your Customer verification
- Identity verification
- Fund availability checks
- Margin monitoring
- Trade surveillance
- Compliance monitoring
- KYC renewal tracking

BrokerVerse attempts to bring these workflows into a single platform.

The project was built around the idea of combining a modern web application with AI-assisted automation.

Instead of treating KYC as a simple document upload process, BrokerVerse introduces an AI-assisted verification workflow that can inspect:

1. PAN card
2. Government identity document
3. Front side of the identity document
4. Back side of the identity document
5. Live selfie

The system can then use a multimodal AI model to inspect the documents and determine whether the selfie appears to belong to the same person shown on the identity document.

> **Important:** AI-assisted verification in this project is intended as a demonstration and automation layer. It should not be considered a legally sufficient standalone KYC or identity verification system for a production financial institution.

---

# Features

## 1. Authentication

BrokerVerse includes user authentication functionality.

Users can:

- Sign up
- Log in
- Access authenticated features
- Maintain their own workspace
- Access data associated with their account

Authentication is implemented using JWT-based authentication.

---

## 2. Demo Data and Real User Data

The application supports demonstration data so that the platform can be explored without requiring a large amount of manually created data.

However, the project differentiates between:

- Demo data
- User-owned data

Demo clients can be seeded into the application for demonstration purposes.

When an authenticated user starts using BrokerVerse, newly onboarded clients are associated with that specific user.

This allows the system to support the concept of individual brokerage workspaces.

Conceptually:

```text
Demo User / Unauthenticated Experience
        │
        ├── Demo Clients
        ├── Demo Funds
        ├── Demo Margins
        └── Demo Analytics


Authenticated User
        │
        ├── User's Clients
        ├── User's Funds
        ├── User's Margin Data
        └── User's Operational Data
```

---

# 3. AI-Assisted KYC Verification

One of the major features of BrokerVerse is AI-assisted client onboarding.

The KYC workflow accepts:

- Client name
- PAN document
- Government identity document front
- Government identity document back
- Live selfie

The backend sends the images to Gemini for multimodal analysis.

The AI-assisted workflow attempts to:

- Inspect the submitted documents
- Read relevant information
- Compare the entered name with document information
- Inspect the identity document
- Compare the photograph on the identity document with the uploaded selfie
- Check image clarity
- Extract selected information where possible
- Return a confidence score

Example conceptual response:

```json
{
  "same_person": true,
  "confidence": 0.91,
  "reason": "The submitted selfie appears consistent with the identity document photograph.",
  "pan_masked": "ABCDE****F",
  "dob": "2002-01-01",
  "address": "Extracted address if readable"
}
```

The backend applies a confidence threshold before marking the onboarding process as successful.

---

# 4. Client Onboarding

Users can onboard new clients into their brokerage workspace.

During onboarding, the application:

1. Accepts client information
2. Receives KYC documents
3. Receives a live selfie
4. Sends the documents for AI-assisted verification
5. Validates the verification result
6. Creates a client record
7. Associates the client with the currently authenticated user
8. Stores selected extracted information
9. Marks the KYC status appropriately

Each user receives independently generated client records.

---

# 5. KYC Expiry Monitoring

BrokerVerse tracks KYC expiry information for clients.

The backend provides functionality for identifying clients whose KYC is approaching expiry.

The system can query clients based on a time horizon.

For example:

```text
Today
  │
  └── Check clients with KYC expiry within next 30 days
          │
          ├── Return matching clients
          └── Surface them in the application
```

This functionality can later be extended with:

- Email notifications
- Dashboard alerts
- Automated reminders
- Compliance workflows
- Scheduled background jobs

---

# 6. Funds Check

The application includes a funds-checking workflow.

This feature is intended to help simulate the process of evaluating client fund availability and related financial information.

The frontend provides a dedicated interface for the funds-checking workflow.

---

# 7. Margin Reporting

BrokerVerse includes margin-related reporting functionality.

Users can access margin information and reports through the application.

The architecture is designed so that margin-related data can be associated with clients and operational workflows.

---

# 8. Trade Watchdog

The project also includes a Trade Watchdog module.

This feature represents a trade monitoring and surveillance workflow.

Potential future extensions include:

- Suspicious trade detection
- Rule-based alerts
- Abnormal trading behavior detection
- AI-assisted anomaly detection
- Risk scoring
- Compliance alerts

---

# 9. Dashboard

The BrokerVerse dashboard provides a centralized view of brokerage-related information.

The dashboard can display:

- Client information
- Operational statistics
- Fund information
- Margin-related information
- KYC alerts
- Other brokerage analytics

Demo data allows the dashboard to remain useful when exploring the platform before a user has onboarded clients.

---

# System Architecture

```text
                         ┌─────────────────────┐
                         │      Next.js        │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS / REST API
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │      Backend        │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ PostgreSQL   │  │    Gemini    │  │ Authentication│
          │   Database   │  │ Multimodal AI│ │      JWT       │
          └──────────────┘  └──────────────┘  └──────────────┘
```

---

# Tech Stack

## Frontend

The frontend is built using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Client-side authentication handling
- Context API / React hooks

The frontend communicates with the FastAPI backend through REST APIs.

The backend URL is configured using:

```env
NEXT_PUBLIC_API_URL
```

Example:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

---

## Backend

The backend is built using:

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- JWT authentication
- Passlib
- Python Multipart
- PostgreSQL
- Uvicorn

The backend exposes API endpoints for:

- Authentication
- Dashboard data
- Client management
- KYC onboarding
- Funds
- Margin reporting
- Trade monitoring

---

## AI

The KYC verification workflow uses Google's Gemini API.

Gemini is used as a multimodal model capable of analyzing:

- Images
- Identity documents
- Text visible in documents
- Face similarity between an identity document and a selfie

The model name is configurable through the backend implementation.

For example, the project can use:

```text
gemini-flash-latest
```

The API key is stored as an environment variable:

```env
GEMINI_API_KEY=your_api_key
```

---

## Database

The project uses:

- PostgreSQL for production
- SQLite support for local development and demonstrations
- SQLAlchemy as the ORM
- Alembic for database migrations

The project intentionally separates database initialization behavior.

### SQLite

For local development, missing tables can be created automatically.

### PostgreSQL

For PostgreSQL environments, Alembic acts as the source of truth for database schema migrations.

Run:

```bash
alembic upgrade head
```

when database migrations need to be applied.

---

# Database Architecture

The database is centered around users and their clients.

A simplified conceptual schema looks like this:

```text
┌──────────────────────────┐
│          users           │
├──────────────────────────┤
│ id                       │
│ email                    │
│ hashed_password          │
│ ...                      │
└────────────┬─────────────┘
             │
             │ owns
             │
             ▼
┌──────────────────────────┐
│         clients          │
├──────────────────────────┤
│ id                       │
│ owner_id                 │
│ is_demo                  │
│ client_code              │
│ full_name                │
│ pan_masked               │
│ dob                      │
│ address                  │
│ kyc_status               │
│ kyc_expiry_date          │
│ notified                 │
│ profit                   │
│ status                   │
│ ...                      │
└──────────────────────────┘
```

## User and Client Relationship

Each real client can be associated with an authenticated user.

Conceptually:

```text
User
 │
 ├── Client 1
 ├── Client 2
 ├── Client 3
 └── Client N
```

The `owner_id` field allows BrokerVerse to distinguish between clients belonging to different users.

The `is_demo` field distinguishes seeded demonstration records from user-created records.

---

# Backend API Structure

The FastAPI backend includes routers for multiple application modules.

Conceptually:

```text
backend/
│
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── security.py
│   ├── seed.py
│   │
│   └── routers/
│       ├── auth.py
│       ├── dashboard.py
│       ├── kyc.py
│       ├── clients.py
│       ├── funds.py
│       ├── margin.py
│       └── watchdog.py
│
├── api/
│   └── index.py
│
├── alembic/
│
├── requirements.txt
└── ...
```

---

# API Modules

## Authentication

Handles:

- User registration
- Login
- JWT generation
- Authentication validation
- Optional/current user access

---

## Dashboard

Provides data required by the main BrokerVerse dashboard.

This can include:

- Client statistics
- Financial summaries
- Operational metrics
- Demo data
- User-specific data

---

## KYC

The KYC module handles:

- Client onboarding
- Document uploads
- Selfie uploads
- Gemini-based AI verification
- Name comparison
- Document information extraction
- Identity/selfie comparison
- KYC expiry monitoring

Example endpoint:

```text
POST /api/kyc/onboard
```

Example health endpoint:

```text
GET /api/health
```

---

## Clients

Handles client-related operations.

Examples include:

- Retrieving clients
- Accessing user-owned clients
- Client-specific information

---

## Funds

Provides funds-related functionality.

The corresponding frontend page is available through:

```text
/check-funds
```

---

## Margin

Provides margin-related reports and functionality.

The frontend includes:

```text
/margin-report
```

---

## Trade Watchdog

Provides trade monitoring functionality.

The frontend includes:

```text
/trade-watchdog
```

---

# Project Structure

```text
BrokerVerse/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── lib/
│   │       ├── api.ts
│   │       └── utils.ts
│   │
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── ...
│
├── backend/
│   │
│   ├── api/
│   │   └── index.py
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── seed.py
│   │   │
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       ├── kyc.py
│   │       ├── clients.py
│   │       ├── funds.py
│   │       ├── margin.py
│   │       └── watchdog.py
│   │
│   ├── alembic/
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md
```

---

# Local Setup

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- Python 3.10 or newer
- PostgreSQL, if using PostgreSQL locally
- Git

You will also need:

- A Gemini API key for AI-assisted KYC verification

---

# Step 1: Clone the Repository

```bash
git clone <your-repository-url>
```

Move into the project:

```bash
cd BrokerVerse
```

---

# Step 2: Set Up the Backend

Move into the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it.

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### Windows Command Prompt

```cmd
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Step 3: Configure Backend Environment Variables

Create a `.env` file inside:

```text
backend/.env
```

Example:

```env
DATABASE_URL=your_database_connection_string

SECRET_KEY=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

CORS_ORIGINS=http://localhost:3000
```

If deploying the frontend separately, include the deployed frontend URL:

```env
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain
```

Do not commit your real `.env` file.

---

# Step 4: Configure the Database

## Using SQLite

If the project is configured to use SQLite, missing tables can be created during startup.

Run the backend:

```bash
uvicorn app.main:app --reload
```

---

## Using PostgreSQL

Configure:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
```

Then apply migrations:

```bash
alembic upgrade head
```

After that, run:

```bash
uvicorn app.main:app --reload
```

The API should now be available locally.

FastAPI documentation should be available at:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/api/health
```

---

# Step 5: Set Up the Frontend

Open another terminal.

Move into:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

The frontend should be available at:

```text
http://localhost:3000
```

---

# Production Deployment

BrokerVerse can be deployed as two separate applications:

```text
Frontend → Vercel
Backend  → Vercel
Database → PostgreSQL provider
```

---

# Frontend Deployment

Deploy the `frontend` directory as a Next.js application.

Set the Vercel Root Directory to:

```text
frontend
```

Add the environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

After changing a `NEXT_PUBLIC_*` variable, redeploy the frontend because these values are used during the Next.js build process.

---

# Backend Deployment

Deploy the `backend` directory as a FastAPI application.

The Vercel Root Directory should be:

```text
backend
```

The backend entry point is:

```text
backend/api/index.py
```

The entry file exposes the FastAPI application:

```python
from app.main import app
```

The backend requires environment variables such as:

```env
DATABASE_URL=your_postgres_connection_string
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=https://your-frontend-domain
```

After changing environment variables, redeploy the backend.

---

# Environment Variables

## Backend

```env
DATABASE_URL=
SECRET_KEY=
GEMINI_API_KEY=
CORS_ORIGINS=
```

Depending on your authentication implementation, additional environment variables may be required.

---

## Frontend

```env
NEXT_PUBLIC_API_URL=
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain
```

---

# Build Commands

## Frontend

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Backend

Development:

```bash
uvicorn app.main:app --reload
```

---

# Security Considerations

This project includes authentication and KYC-related workflows. Therefore, sensitive configuration must never be committed to the repository.

The following should remain private:

```text
.env
.env.local
GEMINI_API_KEY
DATABASE_URL credentials
JWT secrets
Production passwords
```

The `.gitignore` file should exclude environment files and generated directories such as:

```text
node_modules/
.next/
venv/
__pycache__/
.env
.env.local
```

---

# AI Verification Disclaimer

The KYC verification system uses AI to assist with:

- Document inspection
- Information extraction
- Image quality analysis
- Name comparison
- Identity document and selfie comparison

The AI result should be treated as an assistance mechanism rather than a legally binding KYC decision.

A real-world production system should additionally consider:

- Liveness detection
- Dedicated biometric verification services
- OCR validation
- Document authenticity checks
- Fraud detection
- Human review
- Regulatory compliance
- Data encryption
- Secure document storage
- Audit logging
- Consent management
- Data retention policies

---

# Future Improvements

Possible future improvements for BrokerVerse include:

## AI Agents

- Dedicated KYC verification agent
- Trade surveillance agent
- Risk analysis agent
- Margin monitoring agent
- Compliance agent

## Notifications

- KYC expiry notifications
- Margin alerts
- Low fund alerts
- Suspicious trade alerts
- Email notifications
- In-app notifications

## Analytics

- Advanced brokerage analytics
- Client profitability analysis
- Risk scoring
- Trade pattern analysis
- AI-generated insights

## Security

- Refresh tokens
- Role-based access control
- Multi-factor authentication
- Rate limiting
- Audit logs
- Secure document storage
- Encryption for sensitive client information

## KYC

- OCR-based document extraction
- Dedicated face verification APIs
- Liveness detection
- Fraud detection
- Human approval workflows
- Compliance review queues

---

# Current Development Status

BrokerVerse currently provides the foundation for an AI-assisted brokerage operations platform.

The project includes:

- Full-stack architecture
- Next.js frontend
- FastAPI backend
- JWT authentication
- User-specific data ownership
- Demo data support
- Client onboarding
- AI-assisted KYC verification
- Gemini integration
- KYC expiry tracking
- Funds workflow
- Margin reporting
- Trade monitoring
- PostgreSQL/SQLite support
- SQLAlchemy ORM
- Alembic migrations
- Vercel deployment support

---

# Running the Complete Project Locally

Open two terminals.

## Terminal 1 — Backend

```bash
cd BrokerVerse/backend

python -m venv venv
```

Activate the environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure `.env`.

Then:

```bash
uvicorn app.main:app --reload
```

---

## Terminal 2 — Frontend

```bash
cd BrokerVerse/frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Contributing

1. Create a new branch
2. Make your changes
3. Test the frontend:

```bash
npm run build
```

4. Test the backend
5. Commit the changes
6. Push the branch
7. Open a pull request

---

# License

This project is currently intended for educational, portfolio, and demonstration purposes.

---

# Author

**Abhyuday Rastogi**

Co-Founder, Ascraa

BrokerVerse is a project exploring how AI, modern web development, and backend automation can be combined to improve brokerage and financial operations.
