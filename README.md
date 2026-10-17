# ExamSphere Pro — Online Examination Platform (MERN + Supabase)

**ExamSphere Pro** is an enterprise-grade, AI-proctored online examination and certification platform built using the **MERN** stack (MongoDB/PostgreSQL/Supabase compatible, Express.js, React, Node.js) with native **Supabase PostgreSQL** compatibility.

---

## 🌟 Key Features

### 🎓 1. Student / Candidate Experience
- **Interactive Assessment Catalog**: Filter exams by category (*Software Engineering, Computer Science, Cloud & DevOps, AI*), search, and access-code protection.
- **Proctored Examination Room**:
  - **Live Countdown Timer** with critical urgency alerts (<5 mins).
  - **Question Palette**: Quick visual navigation with color-coded node states (*Answered [Green], Review [Purple], Unanswered [Orange], Current [Indigo]*).
  - **Supported Question Types**:
    - Multiple Choice Questions (Single Choice Radio)
    - Multi-Select Checkboxes (Partial & multi-criteria evaluation)
    - True / False toggles
    - Short Answer / Text input
    - Code Snippet block with syntax styling
  - **Answer Controls**: Clear Response, Mark for Review, Next / Previous navigation, and Review & Submit confirmation dialog.
- **Automated Instant Grading**:
  - Instant score calculation with negative marking deductions.
  - Passing status badge, percentage, accuracy breakdowns.
  - Comprehensive question-by-question solution review with verified answers and examiner explanations.
- **Verifiable Certificate of Achievement**:
  - Official Certificate generation with candidate name, score, issue date, verification ID, and authorized examiner signature.
  - High-resolution **PNG Certificate Download** (powered by HTML5 Canvas) & Print options.

### 🛡️ 2. Anti-Cheating & AI Proctoring Guard
- **Tab-Switch & Blur Detection**: Real-time detection when candidates switch tabs, minimize windows, or use `Alt+Tab`.
- **Strike Violation Counter**: Warning modal showing violation count against examiner threshold (e.g., 3 strikes before automatic disqualification).
- **Fullscreen Enforcement**: Monitors fullscreen state and logs exits.
- **Virtual AI Proctor Camera**: Real-time simulated AI webcam feed with facial tracking bounding box (`Face Locked 99.4%`) and focus state indicators.
- **Clipboard & Context-Menu Protection**: Disables right-click, cut, copy, and unauthorized keyboard shortcuts.
- **Server Audit Log**: Every violation is recorded with timestamp and reason in the database.

### 👩‍🏫 3. Examiner & Administrator Studio
- **Role Switcher**: Switch seamlessly between **Student** and **Examiner** roles directly from the navigation bar.
- **Assessment Authoring Studio**:
  - Configure exam title, category, duration, passing percentage, negative marking penalties, tab-switch limits, and access codes.
  - Dynamic Question Builder: Add/remove options, designate multiple correct answers, attach code snippets, marks, and explanation text.
- **Live Proctor & Cohort Analytics**:
  - Class pass rate, average score, and highest/lowest score metrics.
  - **Question Difficulty Heatmap**: Progress bar visualization showing per-question accuracy across all candidates.
  - **Proctoring Integrity Audit Table**: Inspect every candidate's submission, score, time taken, and detailed violation audit log.

---

## 🏗️ Architecture & Supabase Compatibility

ExamSphere Pro provides a **dual-mode persistence architecture**:

1. **Supabase PostgreSQL Mode (Production)**:
   - Connects directly to Supabase via `@supabase/supabase-js`.
   - Uses relational schemas with Row Level Security (RLS) policies and indexes.
   - Pre-written migration script: `server/supabase_schema.sql`.

2. **Supabase In-Memory PostgreSQL Emulator (Development / Demo)**:
   - Runs out of the box with zero database configuration.
   - Pre-seeded with 4 certification assessments, question banks, and candidate submission history.
   - The moment you add your Supabase credentials into `server/.env`, the server automatically switches to your live Supabase database!

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- **npm** v9+ installed

### 2. Installation
From the root project directory:
```bash
# Install dependencies for both server and client
npm run install:all
```

Or install separately:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Start the Application
You can run both client and server:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Starts Express server on http://localhost:5000
```

**Terminal 2 (React Frontend):**
```bash
cd client
npm run dev
# Starts Vite frontend on http://localhost:3000
```

Open your browser at: **`http://localhost:3000`**

---

## ⚡ Connecting to Your Supabase Project

To connect ExamSphere Pro to your real Supabase PostgreSQL instance:

1. **Create a project** on [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `server/supabase_schema.sql`, copy all SQL contents, and click **Run**.
   - This creates `profiles`, `exams`, `questions`, and `exam_attempts` tables, sets RLS policies, indexes, and seeds the sample exams!
4. Go to **Project Settings -> API** in Supabase and copy:
   - `Project URL`
   - `anon / public` key or `service_role` key
5. Open `server/.env` and update:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-or-service-key
   ```
6. Restart your server (`cd server && npm run dev`).
   - The console will display: `⚡ Supabase Client initialized successfully` and the frontend navbar badge will switch to **"Supabase Live"**!

---

## 📂 Project Structure

```
Online Eximation Website/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Navbar, ProctorCamera, AntiCheatModal, CertificateModal
│   │   ├── pages/               # Dashboard, ExamCatalog, ExamRoom, ExamResult, ExamCreator, Analytics, StudentHistory
│   │   ├── context/             # AuthContext (Role switching, Supabase health telemetry)
│   │   ├── lib/                 # api.js (Frontend REST API client)
│   │   ├── index.css            # Dark glassmorphic design system tokens & animations
│   │   ├── App.jsx              # Main view orchestrator & navigation
│   │   └── main.jsx
│   ├── index.html               # Responsive HTML with Google Fonts
│   ├── package.json
│   └── vite.config.js           # Dev server with /api proxy to port 5000
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # supabase.js (Supabase client), db.js (persistence adapter)
│   │   ├── controllers/         # examController, attemptController, analyticsController, authController
│   │   ├── routes/              # examRoutes, attemptRoutes, analyticsRoutes, authRoutes
│   │   ├── data/                # defaultData.js (High-quality seed exams & questions)
│   │   └── server.js            # Express server entry point
│   ├── supabase_schema.sql      # Supabase PostgreSQL schema with RLS & seed data
│   ├── package.json
│   └── .env.example
├── package.json                 # Monorepo coordinator script
└── README.md
```

---

## 🔒 Security & Proctoring Checklist
- [x] Candidate answer masking during live test (correct answers and explanations are only delivered post-submission).
- [x] Automatic grading with negative marking calculation.
- [x] Window blur and visibility change listeners tracking tab switches.
- [x] Fullscreen enforcement mode.
- [x] Right-click context menu and copy shortcut interception.
- [x] Automated submission on countdown timer expiry.
- [x] Canvas cryptographically rendered verifiable completion certificates.
- [x] Supabase Row Level Security (RLS) data policies.
