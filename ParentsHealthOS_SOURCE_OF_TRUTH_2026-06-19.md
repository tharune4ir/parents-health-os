# Parents Health OS — Single Source of Truth & System Blueprint
**Document Version:** 1.0 (Institutional-Grade)  
**Date of Generation:** 2026-06-19  
**System Status:** Sandbox Dev Mode Active  

---

## 1. Project Executive Summary & Philosophy

### 1.1 Core Purpose
**Parents Health OS** (First Family Care Console) is a context-aware geriatric care operations dashboard. It addresses the high digital barriers of elderly care by introducing a dual-surface communication layout:
1. **The Parent Experience (WhatsApp-First):** Elderly parents do not interact with dashboards. They interact with **Anaya** (the Care Automation Assistant) via simple WhatsApp templates in their preferred language (English, Hindi, or Telugu).
2. **The Coordinator Console (Care Operations Dashboard):** Care team coordinators monitor alerts, track daily routines, configure baseline assessments, audit lab reports, and prepare clinical briefs.
3. **The Adult Child Experience (Family Snapshot View):** Adult child sponsors receive a simplified overview of their parent's wellness state without deep clinical complexity.

### 1.2 The Architectural Pivot: Context-Aware Triage
Standard physiological systems flag vital alerts using generalized population metrics (e.g., blood glucose > 140 mg/dL is marked "High/Danger"). 
In geriatrics, strict glycemic control can lead to **hypoglycemia** (low blood sugar), which causes dizziness, balance loss, and catastrophic bone-breaking falls. 
Parents Health OS evaluates raw vitals through a **geriatric engine** that calibrates alert thresholds based on the parent's age, chronic conditions, and personal baseline risk score. For instance:
- A blood sugar reading of **160 mg/dL** for a 75-year-old diabetic senior is flagged as **safe/acceptable** to prevent falls, rather than raising alarms.
- Triage levels are reframed to use warmer, clinical-coordination branding (e.g., **Urgent Follow-up** instead of "Critical") to keep focus on supportive care and avoid alarm fatigue.

### 1.3 Aesthetics & Neural Typography
The frontend utilizes the **Neural Glass** design system:
- **Backgrounds:** Deep slate/teal gradients (`slate-950` base) with glassmorphic layers (`backdrop-blur-xl`, `bg-white/5`).
- **Typography:** High-contrast Clean White headers (`font-black` or `font-semibold` in Outfit font) optimized for geriatric legibility.
- **Accents:** Glowing cyan, emerald, and orange borders indicating status levels and precise medical grids.

---

## 2. Production Dependencies

The project uses Next.js 16 (App Router), React 19, and Tailwind CSS v4.

### 2.1 Core Dependencies (`package.json`)
*   **Next.js:** `16.1.4` (App Router, Turbopack compiler)
*   **React / React DOM:** `19.2.3`
*   **Google Generative AI SDK:** `^0.24.1` (Gemini API for report parsing)
*   **Supabase SSR Auth & Client:** `@supabase/ssr: ^0.10.3`, `@supabase/supabase-js: ^2.106.2`
*   **Animation Engine:** `framer-motion: ^12.29.0`
*   **Icons Library:** `lucide-react: ^0.563.0`
*   **Parser & Utilities:** `react-markdown: ^9.1.0`, `react-dropzone: ^14.3.8`, `clsx: ^2.1.1`, `tailwind-merge: ^3.4.0`

### 2.2 Development Dependencies
*   **Tailwind CSS (v4 Compiler & PostCSS):** `tailwindcss: ^4`, `@tailwindcss/postcss: ^4`
*   **React Compiler Plugin:** `babel-plugin-react-compiler: 1.0.0`
*   **TypeScript:** `typescript: ^5`
*   **Linter:** `eslint: ^9`, `eslint-config-next: 16.1.4`
*   **Typings:** `@types/node: ^20`, `@types/react: ^19`, `@types/react-dom: ^19`

---

## 3. Database Schemas & Data Pipeline

The database design contains 14 relational tables. In **Local Sandbox Mode**, this schema is fully modeled in `localStorage` namespaces, isolated by `parentId` (e.g., `parents_health_vitals_[parentId]`).

### 3.1 Relational Schema Definitions (PostgreSQL DDL)

#### 1. `profiles`
Tracks credentials and system-wide roles for care team members.
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('caregiver', 'doctor', 'admin'))
);
```

#### 2. `families`
Groups caregivers and parents into shared care workspaces.
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id)
);
```

#### 3. `family_members`
Links coordinator and caregiver profiles to families.
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 4. `parents`
Monitored geriatric profiles.
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  assessment_answers JSONB,
  risk_score INTEGER DEFAULT 0,
  whatsapp_number TEXT
);
```

#### 5. `consents`
Records DPDPA regulatory compliance checkboxes.
```sql
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES profiles(id),
  consent_type TEXT NOT NULL, -- e.g. 'gemini_report_analysis'
  status TEXT CHECK (status IN ('granted', 'revoked')) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE
);
```

#### 6. `vitals`
Saves blood pressure, pulse, weight, and blood sugar logs.
```sql
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  logged_by UUID REFERENCES profiles(id),
  bp_sys INTEGER,
  bp_dia INTEGER,
  sugar INTEGER,
  sugar_context TEXT CHECK (sugar_context IN ('fasting', 'post_prandial', 'random')),
  pulse INTEGER,
  weight NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);
```

#### 7. `medications`
Pharmacological prescriptions active for the parent.
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  timing TEXT, -- morning, bedtime, afternoon, evening
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 8. `medication_logs`
Tracks medication administration history.
```sql
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  logged_by UUID REFERENCES profiles(id),
  taken BOOLEAN NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  scheduled_date DATE NOT NULL,
  notes TEXT
);
```

#### 9. `lab_reports`
AI diagnostic report summaries and parsed biomarker profiles.
```sql
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  summary_for_child TEXT,
  summary_for_parent TEXT,
  key_findings TEXT[],
  biomarkers JSONB,
  possible_questions TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  consent_id UUID REFERENCES consents(id)
);
```

#### 10. `doctors`
Specialist contacts assigned to the family care team.
```sql
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  hospital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 11. `care_teams`
Maps doctors to parents.
```sql
CREATE TABLE care_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  role_description TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 12. `ai_conversations`
Maintains conversational query logs with the assistant.
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_role TEXT CHECK (message_role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### 13. `whatsapp_messages`
Inbound/outbound message history for the simulated WhatsApp panel.
```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'failed')) NOT NULL
);
```

#### 14. `audit_log`
Compliance monitoring audit log.
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address TEXT,
  details JSONB
);
```

### 3.2 Data Pipeline & Offline Resilience Flow
The offline sync pipeline follows a strict state progression:

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│  User Action /  │ ─────>│   Local Store    │ ─────>│   Sync Queue Event   │
│  State Mutation │       │  (localStorage)  │       │     (Max: 100)       │
└─────────────────┘       └──────────────────┘       └──────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│   Settings /    │ <─────│  Simulate Sync   │ <─────│   Transition state   │
│ Live Db Connect │       │   Action Click   │       │  'pending' -> 'synced'│
└─────────────────┘       └──────────────────┘       └──────────────────────┘
```
- **Error Boundaries:** `src/lib/offline/localPersistence.ts` protects inputs with JSON serialization try-catches.
- **Size Caps:** The queue limits mutations to the last `100` elements to protect browser memory constraints.
- **Supabase Auto-Connect:** If `NEXT_PUBLIC_SUPABASE_URL` is detected, the context dynamically overrides local storage queries with Supabase clients.

---

## 4. System Engines & Algorithms

### 4.1 Geriatric Care Plan Engine (`src/utils/carePlanEngine.ts`)
Converts 15 geriatric camp questions into clinical protocols.
- **Rule 1: Care Status Resolution:**
  - `Discuss with doctor` is triggered if the senior has suffered a fall in the past 12 months, or reports dizziness/breathlessness.
  - `Needs attention` is triggered if signals are flagged for forgetfulness, severe pain, or low mood.
  - `Needs family review` is triggered if mobility requires aid (stick, walker, bedridden) or ADL assistance.
  - `Stable routine` is the default.
- **Rule 2: Vital Tasks Generation:**
  - If hypertensive, logs morning seated BP measurement.
  - If diabetic, schedules fasting glucose checks.

### 4.2 Care Team Coordinator & Doctor Briefs (`src/utils/careTeamEngine.ts`)
Creates collaborative discussion briefings:
- **Brief Blueprint:** Compiles chronic history, active prescriptions, latest reports, and generates pre-configured list of questions.
- **Disclaimer Banner:** Embeds warning indicating briefs do not constitute diagnostic medical advice and are designed strictly for clinician review.

### 4.3 Gemini Analysis Route (`src/app/api/analyze/route.ts`)
Processes uploaded lab PDFs using `gemini-2.5-flash` with a fallback to `gemini-2.5-flash-lite`.
- **JSON Structure Enforcement:**
  `summaryForChild`, `summaryForParent` (comforting tone), `biomarkers` (name, value, reference, status, ELI5 explanation), `medicines`, and `possibleQuestionsForDoctor`.
- **High-Fidelity Mocks:** Bypasses LLM request if `useMock=true` is requested or the Gemini API key is missing.

---

## 5. Frontend Navigation & Pages

The application is structured into the following pages accessible via the left sidebar:

1. **Command Center:** The primary coordinator dashboard featuring sandbox warning bars, triage priority selectors, and the family snapshot boundary view card.
2. **First Family Intake:** Geriatric registration, profile creation, and DPDPA compliance consent tracking.
3. **Baseline Health Camp:** Bulk screenings for blood pressure, glucose, and weight. Tracks sync states.
4. **Family Records:** In-depth profile details, chronic condition timelines, and prescription rosters.
5. **WhatsApp Automation:** An interactive phone mockup with Hindi/English templates to simulate messaging check-ins.
6. **Care Logs:** Medication compliance metrics, adherence charts, and local backup controllers.
7. **Care Operations Board:** Incident ticket tracker with SMS templates to contact families during escalations.
8. **Reports & Records:** Lab report uploader with structured biomarker displays.
9. **Doctor Briefs:** Roster of care specialists and PDF-ready consult brief generators.
10. **Consults:** Family wallet billing simulation and scheduling appointments.
11. **Settings & Backup:** Clear caches, trigger sync events, and configure API variables.

---

## 6. Developer Operations Runbook

### 6.1 Environment Configuration (`.env.local`)
Create `.env.local` in the project root:
```bash
# Gemini API Key (Required for AI report parsing, fallback mock active if empty)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configurations (Leave empty to keep Local Sandbox mode active)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 6.2 Project Safety Guard
The client file `src/lib/supabase/client.ts` blocks any connections pointing to the reference `lhqtqofjrqoyscobsfud` (the protected production app `trelis-life`) to prevent data overrides.

### 6.3 Commands Reference
- **Install Packages:**  
  `$env:Path += ";C:\Program Files\nodejs"; & "C:\Program Files\nodejs\npm.cmd" install`
- **Start Dev Server:**  
  `$env:Path += ";C:\Program Files\nodejs"; & "C:\Program Files\nodejs\npm.cmd" run dev`
- **Build Production Bundle:**  
  `$env:Path += ";C:\Program Files\nodejs"; & "C:\Program Files\nodejs\npm.cmd" run build`
