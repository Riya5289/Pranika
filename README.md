# Pranika — Healthcare Coordination Platform

A full-stack healthcare coordination platform built with Vite + React, Node.js + Express, and MongoDB Atlas.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | Vite, React 18, TailwindCSS, unplugin-icons     |
| Backend   | Node.js, Express.js                             |
| Database  | MongoDB Atlas (cloud)                           |
| Auth      | JWT + bcrypt + math captcha                     |
| Fonts     | Bebas Neue, Roboto, Monda (Google Fonts)        |

---

## Project Structure

```
pranika/
├── server/                  # Express backend
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── utils/              # Captcha utility
│   ├── server.js           # Entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
│
└── frontend/               # Vite + React frontend
    ├── src/
    │   ├── components/     # Header, Footer, HospitalCard, StatusBadge, etc.
    │   ├── context/        # AuthContext (JWT state)
    │   ├── pages/          # Login, Signup, Hospitals, Availability, Transfer
    │   ├── services/       # api.js (axios wrapper)
    │   ├── App.jsx         # Router + Layout
    │   ├── main.jsx
    │   └── index.css       # Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

---

## Setup Instructions

### 1. MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster
2. Create a database user with read/write access
3. Whitelist your IP (or use `0.0.0.0/0` for development)
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/pranika?retryWrites=true&w=majority
   ```

### 2. Backend Setup

```bash
cd server
npm install

# Create your environment file
cp .env.example .env
# Edit .env and fill in your MONGODB_URI and a strong JWT_SECRET

npm run dev   # starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# (Optional) create .env if you want a custom API URL
cp .env.example .env

npm run dev   # starts on http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

---

## Seeding Sample Data

Once you're logged in, the UI will show "Load Sample Hospitals" / "Load Sample Data" buttons automatically when no data exists.

Or call the seed endpoints directly (requires auth token):

```
GET /api/hospitals/seed   → Seeds 8 hospitals (MP region)
GET /api/resources/seed   → Seeds resource data for all hospitals
```

---

## API Reference

### Public
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/captcha/generate | Get math captcha    |
| POST   | /api/auth/signup      | Register new user   |
| POST   | /api/auth/login       | Login, returns JWT  |

### Protected (Bearer token required)
| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | /api/hospitals             | List hospitals (with filters)  |
| GET    | /api/hospitals/:id         | Hospital detail                |
| GET    | /api/hospitals/seed        | Seed sample hospitals          |
| GET    | /api/resources             | Live bed/equipment data        |
| GET    | /api/resources/seed        | Seed resource data             |
| POST   | /api/transfers             | Create transfer request        |
| GET    | /api/transfers             | My transfer history            |
| GET    | /api/transfers/suggestions | Smart hospital suggestions     |

---

## Design System

| Element         | Value                                           |
|-----------------|-------------------------------------------------|
| Heading font    | Bebas Neue 48px                                 |
| Sub-heading     | Roboto Bold 32px                                |
| Body font       | Monda 20px                                      |
| Primary color   | #EB5E28 (orange)                                |
| Accent color    | #EFA7A7 (pink) — header, footer, sidebar        |
| Icon gradient   | #EB5E28 → #23B5D3 (bottom-left → top-right)    |
| Buttons         | rounded-full, white text on gradient background |
| Max width       | 1200px centered                                 |

---

## Pages

| Route            | Access    | Description                        |
|------------------|-----------|------------------------------------|
| `/login`         | Public    | JWT login with math captcha        |
| `/signup`        | Public    | Registration with validation       |
| `/hospitals`     | Protected | Searchable hospital registry       |
| `/hospitals/:id` | Protected | Hospital detail + quick actions    |
| `/availability`  | Protected | Live bed & equipment dashboard     |
| `/transfer`      | Protected | Smart patient transfer system      |

---

## Environment Variables

### server/.env
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_strong_secret_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### frontend/.env (optional)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Features

- **JWT Authentication** — secure login/signup with token stored in localStorage
- **Math Captcha** — server-generated, single-use, 5-minute expiry
- **Hospital Registry** — search by name, filter by specialty/type/distance
- **Live Availability Dashboard** — bed bars, oxygen status, color-coded status badges
- **Smart Transfer System** — resource-aware hospital matching with ETA calculation
- **Transfer History** — view all past transfer requests with status tracking
- **Protected Routes** — unauthenticated users redirected to login
- **Responsive UI** — works on mobile, tablet, and desktop
- **Sample Data Seeding** — one-click seed buttons in the UI

---

## Extension Idea: AI Voice Emergency Triage (Deepgram + Gemini)

Good idea. It reduces operator load and speeds up triage if implemented with strict safety guardrails.

### Implementation Overview

1. **Call intake + transcription**
   - Stream caller audio to Deepgram in real time.
   - Keep partial + final transcripts with timestamps.
2. **Structured triage extraction (Gemini)**
   - Send transcript to Gemini with a strict JSON schema output:
     - casualty type (trauma, stroke, cardiac, burn, etc.)
     - severity (critical/high/medium/low)
     - required specialists/surgeons
     - key resources (ICU, OT, ventilator, blood, etc.)
     - confidence score and missing data questions
3. **Hospital matching**
   - Map casualty/resources to your existing specialist + resource models.
   - Filter hospitals with currently available specialist/resources.
   - Rank by distance from reporter location + readiness score.
4. **Dispatch handoff**
   - Return top 3 options with ETA, contact, and reason.
   - Escalate to a human operator when confidence is low.

### Key Suggestions

- Use **LLM function-calling / JSON mode** only (never free text parsing in backend logic).
- Add a **confidence threshold** and mandatory human override path.
- Store **raw transcript + extracted fields + final decision** for auditability.
- Ask follow-up questions when critical fields are missing (location, age, consciousness, bleeding, breathing).

### Main Challenges

- **ASR quality in noisy/multilingual calls**: accents, panic speech, overlap.
- **Clinical misclassification risk**: wrong specialty mapping can delay care.
- **Latency budget**: transcription + LLM + matching must stay near real time.
- **Data privacy/compliance**: sensitive health + location data handling.
- **Operational reliability**: API failures/rate limits for free-tier keys.

### Practical Start (MVP)

- Begin with a **human-in-the-loop assistant**:
  - voice transcript + LLM triage suggestion + ranked hospitals,
  - final confirmation by dispatcher.
- After collecting accuracy metrics, gradually automate low-risk cases.

---

## Production Deployment

1. Build frontend: `cd frontend && npm run build` → deploy `dist/` to Vercel/Netlify
2. Deploy backend to Railway/Render/Fly.io
3. Set `FRONTEND_URL` in server env to your frontend domain
4. Set `VITE_API_URL` in frontend env to your backend domain
5. Ensure MongoDB Atlas IP whitelist includes your server IP
