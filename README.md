# ExamSphere Pro — Serverless Proctored Online Examination System

**ExamSphere Pro** is an enterprise-grade, AI-proctored online examination and certification platform built with a **100% Serverless Architecture** powered directly by **React** and **Supabase Cloud PostgreSQL**. 

No backend server, middleware, or external third-party services are required. The application communicates directly and securely with Supabase using `@supabase/supabase-js` and PostgreSQL Row Level Security (RLS).

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
- **Automated Instant Grading Engine**:
  - Direct client-to-database grading with positive marks and negative marking penalties.
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
- **Direct Audit Logging**: Every violation event is persisted directly to Supabase with timestamp, strike count, and violation type.

### 👩‍🏫 3. Examiner & Administrator Studio
- **Role-Based Access Control**:
  - **Student**: Take exams, track history, view certificates.
  - **Examiner**: Create and author exams, manage questions, inspect analytics and candidate submissions.
  - **Super Admin**: Manage user roles, authorize examiners, and audit platform security.
- **Assessment Authoring Studio**:
  - Configure exam title, category, duration, passing percentage, negative marking penalties, tab-switch limits, and access codes.
  - Dynamic Question Builder: Add/remove options, designate multiple correct answers, attach code snippets, marks, and explanation text.
- **Live Proctor & Cohort Analytics**:
  - Class pass rate, average score, and highest/lowest score metrics.
  - **Question Difficulty Heatmap**: Visualization showing per-question accuracy across all candidates.
  - **Proctoring Integrity Audit Table**: Inspect every candidate's submission, score, time taken, and detailed violation audit log.

---

## 🏗️ 100% Serverless Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React Client (Vite Single Page App)         │
│  - Interactive Exam Room        - Anti-Cheating Proctor     │
│  - Exam Authoring Studio        - Cohort Analytics Engine   │
│  - Super Admin Console          - Certificate Generator     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Direct HTTPS & Web Crypto API
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Cloud PostgreSQL                  │
│  - profiles table (User roles & credentials)                │
│  - exams table (Curriculum & configurations)                │
│  - questions table (Multi-format question bank)             │
│  - exam_attempts table (Submissions & violation audit logs) │
│  - Row Level Security (RLS) Policies                        │
└─────────────────────────────────────────────────────────────┘
```

- **Zero Backend Maintenance**: No Express server, Node.js daemon, or proxy servers needed.
- **Direct Database Connectivity**: Uses `@supabase/supabase-js` directly in the browser with public anon keys.
- **Client-Side Hashing & Grading**: Web Crypto API (`crypto.subtle.digest('SHA-256')`) computes hashes securely in the browser.
- **Deploy Anywhere**: The application builds to a pure static Single Page Application (SPA) ready for Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed

### 2. Run Locally
From the root project directory:
```bash
# Start the serverless application directly
npm run dev
```
Open your browser at: **`http://localhost:3000`**

### 3. Production Build
```bash
npm run build
```
The optimized static build will be generated in `client/dist/`.

---

## ⚡ Supabase Configuration

The application is pre-configured to connect to Supabase. You can also connect your own Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL schema from `supabase/migrations/20261016000000_init_examination_schema.sql` in the Supabase SQL Editor.
3. Configure your project credentials in `client/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
   VITE_ADMIN_EXAMINER_KEY=EXAM_ADMIN_2026
   VITE_SUPER_ADMIN_KEY=SUPER_ADMIN_2026
   ```

---

## 🔒 Security & Integrity Highlights
- **Anti-Cheat Masking**: Student responses are evaluated against masked questions (correct answers and explanations are only retrieved upon completed submission).
- **Proctoring Telemetry**: Tab-switch, window blur, and fullscreen breach listeners with strike counting.
- **PostgreSQL Row Level Security (RLS)**: Enforces table policies at the database layer.
- **Client Hashing**: Passwords stored as SHA-256 hashes in Supabase `profiles`.
