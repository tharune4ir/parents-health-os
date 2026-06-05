# First Family Care Console — Single Source of Truth

This document serves as the absolute "Source of Truth" for the **First Family Care Console** (formerly Parents Health OS) project. If the entire repository were deleted tomorrow, a developer should be able to reconstruct the application exactly as it exists today using only this document, the configuration parameters, and the active code files.

---

## 1. Project Overview

**First Family Care Console** is a premium, context-aware digital health dashboard and care operations platform designed specifically for adult child caregivers managing the healthcare of their aging parents in India.

The primary objective of the application is to bridge the gap between complex clinical data (lab reports, prescriptions, daily vitals) and supportive, daily caregiving tasks. Unlike generic health trackers that flag vitals using standard population ranges, the console evaluates data through a **personalized clinical context**—calibrating warning thresholds and daily routine suggestions based on the parent's specific age, chronic conditions, and clinical risk score.

The application operates in two modes:
1. **Local Sandbox Mode (Active):** Executes 100% in the user's browser, persisting data locally in `localStorage` to ensure absolute privacy and offline capability.
2. **Supabase Cloud Mode (Inactive):** Designed for future cloud sync, sharing, and team collaboration once dedicated database environment variables are configured.

---

## 2. Product Intent & Geriatric Context

Geriatric care has unique challenges: cognitive decline, polypharmacy interactions, sleep disruption, and mobility limitations. Most standard medical apps induce anxiety by presenting test values in red without explaining their clinical relevance in simple terms.

### Caregiving Philosophy
First Family Care Console is designed to be **comforting, reassuring, and context-aware**. If an elderly parent with a history of hypoglycemia has a blood glucose reading of `160 mg/dL`, a generic app would flag this as "dangerously high." However, in geriatric care, keeping a senior's sugar slightly elevated is often a deliberate clinical strategy to prevent hypoglycemia-induced dizziness and subsequent catastrophic falls. The clinical engine understands this context and suppresses false alarms, focusing instead on stabilizing routines.

### India DPDP Compliance (Digital Personal Data Protection Act, 2023)
The app is built from the ground up to respect data privacy constraints under Indian law:
- **Explicit Caregiver Opt-In:** No medical reports, vitals, or clinical notes are sent to external APIs (such as Google Gemini) unless the caregiver gives explicit opt-in consent for analysis.
- **Local Sovereignty:** All personal health records (PHRs) are processed on-device. The browser `localStorage` acts as a zero-knowledge local vault.
- **Audit Logs:** An internal ledger records all data consent actions, uploads, and modifications to maintain a tamper-proof audit trail of DPDPA compliance.

---

## 3. Active Technology Stack

The project runs on a modern frontend architecture optimized for performance, clean typography, and motion design.

### Core Dependencies (from `package.json`)
*   **Framework:** `Next.js ^15.1.0` (App Router architecture, React 19)
*   **Styling:** `TailwindCSS ^4.0.0-alpha.30`
*   **Animation:** `Framer Motion ^12.0.0-alpha.2` (and `@motionone/dom`)
*   **Database Client:** `@supabase/ssr ^0.5.2` and `@supabase/supabase-js ^2.47.10`
*   **AI SDK:** `@google/generative-ai ^0.21.0`
*   **PDF Parsing & Utilities:** `pdfjs-dist ^4.9.155` and `lucide-react ^0.468.0`

### Build Configuration (`next.config.ts`)
The compiler leverages React 19's optimization engine and transpiles Framer Motion subpackages:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["framer-motion", "motion-dom"],
};

export default nextConfig;
```

---

## 4. Local Sandbox Architecture & Flow

When Supabase environment variables are absent, the application defaults to **Local Sandbox Mode**. This sandbox isolates and simulates all backend functions inside the client browser.

### Auth & Workspace Provider (`src/lib/supabase/context.tsx`)
Authentication and data access are managed by the `SupabaseProvider` component, which detects the connection state and maps data hooks accordingly:

1. **State Isolation:** Scoped workspace keys are created for each parent profile under the parent's unique ID (`activeParent.id`).
2. **Auth Simulation:** Users can toggle active parent workspaces without a network connection. A local-first authentication state is simulated using default profiles.
3. **Data Scoping:** All operations (`getVitals`, `addVital`, `getMedications`, etc.) construct parent-scoped keys to isolate records. For example, the key for vitals is `parents_health_vitals_[parentId]`.

---

## 5. Offline Resilience & Sync Engine

To support offline workflows, Parents Health OS features a client-side transaction logs queue that queues user mutations when there is no active server connection.

### Core Files
- `src/lib/offline/localPersistence.ts`: Wraps `localStorage` with error boundaries to prevent data corruption. Provides serialization helpers and trackable sync metadata.
- `src/lib/offline/syncQueue.ts`: Tracks local mutation events using a transaction queue.

### Transaction Log Schema (`SyncEvent`)
```typescript
export type SyncEventType =
  | "profile_updated"
  | "assessment_saved"
  | "medication_updated"
  | "vitals_logged"
  | "observation_added"
  | "checklist_updated"
  | "report_analysis_saved"
  | "backup_restored";

export interface SyncEvent {
  id: string;
  parentId: string;
  type: SyncEventType;
  createdAt: string;
  status: "pending" | "dismissed" | "simulated_synced";
  source: "local_sandbox";
  metadata: Record<string, any>;
}
```

### Sync Operations
*   **Queueing Mutations:** When the user completes a task or saves a record, `addSyncEvent` filters out heavy binary objects or base64 strings and queues the transaction.
*   **Queue Truncation:** Defensively slices the queue to a maximum size of `100` events (`MAX_QUEUE_SIZE`) to stay within `localStorage` quotas.
*   **Simulated Cloud Push:** Caregivers can view queued transactions in the "Backup & Sync" widget and trigger a simulated sync, transition-marking events from `pending` to `simulated_synced`.

---

## 6. WhatsApp Bot Demonstration Framework

To address the high digital barrier for elderly parents, Parents Health OS includes an interactive **WhatsApp Bot simulator**. This visual module represents a zero-learning-curve conversational interface.

### Functional Mechanics
*   **Target Interface:** Located in the Wellness Hub, it displays a mock smartphone running a WhatsApp conversation between the parent profile and **Anaya** (the AI Care Assistant).
*   **Conversational Flow:** The simulator uses pre-configured templates dynamically compiled in the parent's chosen language (e.g., English or Hindi).
*   **Dynamic Response Engine:** Tapping options like "Log BP" or "Mark morning medicines taken" sends messages that instantly update the parent's active state in the parent app dashboard.

---

## 7. Smart Report Analysis (Gemini API)

When a caregiver uploads a diagnostic report, the file is analyzed by the server-side analysis route.

### Endpoint: `/api/analyze` (`src/app/api/analyze/route.ts`)
This API endpoint accepts multipart form-data:
1. **`file`**: The PDF or image file representing the medical report.
2. **`clinicalContext`**: String summarizing the parent's assessment baseline.
3. **`historyContext`**: String listing prior report findings to compute longitudinal trends.
4. **`mode`**: Either `"analysis"` (default) or `"summary"`.
5. **`useMock`**: Toggled via frontend to enforce safe dry-runs.

### Gemini Prompts & Models
*   **Models:** Utilizes `gemini-2.5-flash` with automatic fallback to `gemini-2.5-flash-lite` if the primary model hits latency or quota thresholds.
*   **JSON Enforcement:** The LLM is strictly instructed to return structured JSON containing:
    - Detailed `summaryForChild` (clinical overview)
    - Ultra-comforting `summaryForParent` (WhatsApp friendly text)
    - Extracted `biomarkers` (values, reference ranges, and ELI5 explanations)
    - Extracted `medicines` (strengths, timings, dosages, instructions)
    - Suggested questions to print for the next physician visit.
    - Red flags and clinical verification disclaimers.

### High-Fidelity Mock Response
If the API key is missing or `useMock=true` is requested, the route bypasses AI execution and returns a pre-configured, high-fidelity mock response modeling a geriatric patient with borderline HbA1c (7.2%) and elevated LDL cholesterol (135 mg/dL).

---

## 8. Care Plan & Care Team Rule Engines

To avoid unpredictable LLM hallucinations for core medical logic, the application uses deterministic, rules-based engines to manage care plans, care teams, and agendas.

### Care Plan Engine (`src/utils/carePlanEngine.ts`)
Calculates daily caregiver protocols and schedules based on the parent's assessment questionnaire answers:
*   **Care Status Categorization:**
    - `Discuss with doctor` (Triggered by falls in the last 12 months, dizzy spells, or breathlessness).
    - `Needs attention` (Triggered by forgetfulness, severe pain, or low mood).
    - `Needs family review` (Triggered by mobility impairments or limitations in daily activities [ADLs]).
    - `Stable routine` (Default condition).
*   **Task Generation:** Dynamically schedules vital checks (BP, blood sugar), hydration targets, mobility reminders (e.g., passive joint rotations if bedridden), and active medications.

### Care Team Coordinator (`src/utils/careTeamEngine.ts`)
Simulates the operations of a virtual multidisciplinary care team:
*   **Specialist Nodes:** Dr. Aruna Desai (Family Physician), Dr. Rajan Mehta (Cardiologist), Ms. Sanya Kapoor (Nutritionist), Coach Vikram Singh (Physiotherapist), Dr. Esha Sethi (Mental Wellness), and Amit Verma (Logistics Care Coordinator).
*   **Discussion Guide Brief Generator:** Combines the questionnaire responses, active medications list, current vital records, and lab report biomarkers to compile a clean, PDF-ready briefing paper styled under **Discussion Summary** with a **FOR CLINICAL DISCUSSION ONLY** disclaimer. The briefing focuses on **Recommended Clinician Discussion Points** (questions to ask during the consultation) rather than diagnostic claims, and is reframed as a collaborative **Discussion Guide Brief** (rather than a "Clinical Brief").

### V3 Care Operations & Intake Modules
1. **First Family Intake (`src/components/FamilyIntake.tsx`):**
   - A structured onboarding module collecting patient profile, history, active medications, chronic conditions, and DPDP consent tracking.
   - Saves records directly to the local console under **Local Sandbox Mode** with the **Save & Sync to Local Console** option.
2. **Baseline Health Camp (`src/components/BaselineCamp.tsx`):**
   - Registry capturing free health camp attendees (name, age, vitals: systolic/diastolic BP, blood sugar, weight).
   - Simulates queue sync state, tracking attendees with visual indicators like `SYNCED` and `PENDING SYNC`.
3. **Coordinator Board (`src/components/CoordinatorBoard.tsx`):**
   - Admin control panel for checking alert levels, simulation events, and dispatching communication scripts.
   - Explicitly displays dispatch options as **Simulated Parent WhatsApp** and **Simulated Sponsor SMS** to represent virtual mock messaging flows.
4. **Command Center & Family Snapshot View:**
   - The main dashboard screen serves as the internal company-side care operations command center.
   - An elegant product boundary card indicates that the full console is built for the care operations team, while adult children will eventually receive a simplified **Family Snapshot View** surface (parent status, medicine confirmation, latest vitals, coordinator notes, doctor brief access, and request-a-call actions).
5. **Urgent Follow-up Triage Level:**
   - The critical triage status level has been relabeled from "Critical" to **Urgent Follow-up** to ensure warmer, clinical discussion-oriented branding.

---

## 9. Supabase Database Schemas

The application is structured to utilize 14 core Postgres tables. When migrating to a live database, these schemas must be defined in Supabase. The TypeScript bindings are mapped in `src/lib/supabase/types.ts`:

### 1. `profiles`
Tracks user roles and core credentials.
```typescript
interface Profile {
  id: string; // primary key
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  role: 'caregiver' | 'doctor' | 'admin' | null;
}
```

### 2. `families`
Groups caregiver accounts and parent profiles into a shared care group.
```typescript
interface Family {
  id: string; // primary key
  name: string;
  created_at: string;
  created_by: string; // foreign key -> profiles.id
}
```

### 3. `family_members`
Links profiles to families to define permissions.
```typescript
interface FamilyMember {
  id: string; // primary key
  family_id: string; // foreign key -> families.id
  profile_id: string; // foreign key -> profiles.id
  role: 'owner' | 'member';
  joined_at: string;
}
```

### 4. `parents`
Stores baseline profiles for the elderly parents being monitored.
```typescript
interface Parent {
  id: string; // primary key
  family_id: string; // foreign key -> families.id
  name: string;
  age: number | null;
  gender: string | null;
  created_at: string;
  created_by: string; // foreign key -> profiles.id
  assessment_answers: Record<string, any> | null;
  risk_score: number | null;
  whatsapp_number: string | null;
}
```

### 5. `consents`
Records DPDPA-compliant patient consent approvals.
```typescript
interface Consent {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  caregiver_id: string; // foreign key -> profiles.id
  consent_type: string; // e.g., 'gemini_report_analysis'
  status: 'granted' | 'revoked';
  ip_address: string | null;
  user_agent: string | null;
  recorded_at: string;
  revoked_at: string | null;
}
```

### 6. `vitals`
Stores physiological vital readings.
```typescript
interface Vital {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  logged_by: string; // foreign key -> profiles.id
  bp_sys: number | null;
  bp_dia: number | null;
  sugar: number | null;
  sugar_context: 'fasting' | 'post_prandial' | 'random' | null;
  pulse: number | null;
  weight: number | null;
  recorded_at: string;
  notes: string | null;
}
```

### 7. `medications`
Lists active pharmacological regimens.
```typescript
interface Medication {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  name: string;
  dosage: string | null;
  timing: string | null; // e.g., 'morning', 'bedtime'
  frequency: string | null; // e.g., 'once daily'
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  remarks: string | null;
  created_at: string;
}
```

### 8. `medication_logs`
Tracks daily medication administration.
```typescript
interface MedicationLog {
  id: string; // primary key
  medication_id: string; // foreign key -> medications.id
  logged_by: string; // foreign key -> profiles.id
  taken: boolean;
  taken_at: string | null;
  scheduled_date: string; // YYYY-MM-DD
  notes: string | null;
}
```

### 9. `lab_reports`
Stores metadata and parsed AI models for medical files.
```typescript
interface LabReport {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  uploaded_by: string; // foreign key -> profiles.id
  file_url: string;
  file_name: string;
  mime_type: string | null;
  summary_for_child: string | null;
  summary_for_parent: string | null;
  key_findings: string[] | null;
  biomarkers: Record<string, any>[] | null; // parsed metrics
  possible_questions: string[] | null;
  uploaded_at: string;
  consent_id: string | null; // foreign key -> consents.id
}
```

### 10. `doctors`
Stores geriatric care team contacts.
```typescript
interface Doctor {
  id: string; // primary key
  family_id: string; // foreign key -> families.id
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  hospital: string | null;
  created_at: string;
}
```

### 11. `care_teams`
Maps doctors to parent profiles.
```typescript
interface CareTeam {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  doctor_id: string; // foreign key -> doctors.id
  role_description: string | null;
  assigned_at: string;
}
```

### 12. `ai_conversations`
Maintains records of caregiver chat queries.
```typescript
interface AIConversation {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  profile_id: string; // foreign key -> profiles.id
  message_role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
```

### 13. `whatsapp_messages`
Logs simulated messages sent to/from the parent.
```typescript
interface WhatsAppMessage {
  id: string; // primary key
  parent_id: string; // foreign key -> parents.id
  direction: 'inbound' | 'outbound';
  message_body: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}
```

### 14. `audit_log`
Tracks modifications for regulatory compliance.
```typescript
interface AuditLog {
  id: string; // primary key
  performed_by: string; // foreign key -> profiles.id
  action_type: string; // e.g., 'consent_revoked', 'record_deleted'
  target_table: string;
  target_id: string;
  timestamp: string;
  ip_address: string | null;
  details: Record<string, any> | null;
}
```

---

## 10. Sandbox Environment Variables

The application's runtime variables are configured in `.env.local`.

### Local Sandbox Variables
*   `NEXT_PUBLIC_GEMINI_API_KEY`: Google Gemini API key used for document parsing and clinical health summaries.
*   `WHATSAPP_DRY_RUN=true`: Ensures that WhatsApp Bot events stay inside the browser console and local UI sandbox. Setting this to `false` is blocked until verified Meta Business numbers are integrated.

### Supabase Status (Placeholder Template)
The following variables must remain commented out or absent in `.env.local` to prevent the application from exiting sandbox mode:
```bash
# NEXT_PUBLIC_SUPABASE_URL=https://your-parents-health-os-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_parents_health_os_anon_key_here
# SUPABASE_SERVICE_ROLE_KEY=your_parents_health_os_service_role_key_here
```

---

## 11. Project Safety Guards

Parents Health OS contains hardcoded safety guards to protect the production database of a separate project, **trelis-life** (`lhqtqofjrqoyscobsfud`), from accidental queries or database migrations.

### Safety Guards in `src/lib/supabase/client.ts`
The application runs a validation check on startup to verify that the configured Supabase URL is not pointing to the forbidden database:
```typescript
const FORBIDDEN_PROJECT_REF = 'lhqtqofjrqoyscobsfud'

function assertNotForbiddenProject(url: string | undefined): void {
  if (!url) return
  if (url.includes(FORBIDDEN_PROJECT_REF)) {
    const msg =
      '[Parents Health OS] SAFETY VIOLATION: The configured NEXT_PUBLIC_SUPABASE_URL ' +
      'points to the protected trelis-life project (ref: lhqtqofjrqoyscobsfud). ' +
      'This project must NEVER be used for Parents Health OS. ' +
      'Remove the trelis-life credentials from .env.local immediately.'
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg)
    } else {
      console.error(msg)
    }
  }
}
```

---

## 12. Local Run & Sandbox Setup Instructions

Follow these instructions to run and verify the codebase in local sandbox mode.

### System Prerequisites
- **Node.js:** version `18.17.0` or higher (compatible with Node 20/22).
- **Package Manager:** `npm` (packaged with Node.js).

### Step-by-Step Instructions
1.  **Clone the workspace:**
    ```bash
    git clone https://github.com/tharungajula2/parents-health-os.git
    cd parents-health-os
    ```
2.  **Verify configurations:**
    Ensure `.env.local` exists and contains only your Gemini API Key:
    ```bash
    NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run in development mode:**
    ```bash
    npm run dev
    ```
5.  **Verify sandbox status:**
    Navigate to `http://localhost:3000`. Open the settings menu in the bottom left footer. The sync panel should indicate that the database is running in local sandbox mode.

---

## 13. Migration Roadmap (Supabase Transition)

Use the following step-by-step preflight checklist to migrate Parents Health OS to a live, shared Supabase backend database.

### Phase 1: Dedicated Supabase Setup
1.  **Create a New Project:** Create a fresh project in your Supabase dashboard (suggested name: `parents-health-os`).
2.  **Select Region:** Choose `ap-south-1` (Mumbai, India) to minimize latency for users in India and align with DPDPA expectations.
3.  **Confirm Cost Structure:** Standard plans apply ($25/month for Pro features or Free tier limits). Confirm the pricing plans in the dashboard before upgrading.

### Phase 2: Schema Migration Execution
To initialize the database, execute migrations using the Supabase CLI or the SQL Editor in the Supabase Dashboard.
1.  **Generate Migration Scripts:** Translate the tables from the Supabase Database Schemas (Section 9) into raw SQL DDL.
2.  **Enable Row Level Security (RLS):** Apply RLS policies to all tables to ensure caregivers can only read/write records belonging to their shared family workspace:
    ```sql
    alter table profiles enable row level security;
    alter table families enable row level security;
    alter table family_members enable row level security;
    alter table parents enable row level security;
    alter table vitals enable row level security;
    alter table medications enable row level security;
    alter table medication_logs enable row level security;
    alter table lab_reports enable row level security;
    alter table consents enable row level security;
    ```
3.  **Example Access Policy (Vitals):**
    ```sql
    create policy "Caregivers can view family vitals" on vitals
      for select using (
        exists (
          select 1 from parents
          join family_members on parents.family_id = family_members.family_id
          where parents.id = vitals.parent_id
          and family_members.profile_id = auth.uid()
        )
      );
    ```

### Phase 3: Transitioning the Client Environment
1.  **Configure Credentials:** Once tables and RLS policies are set up, update `.env.local`:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=https://[your-new-ref].supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
2.  **Local Sync Queue Push:** The frontend provider will automatically detect the presence of `NEXT_PUBLIC_SUPABASE_URL` and attempt to initialize the database connection.
3.  **Build Verification:** Run `npm run build` to confirm there are no static compiling or schema validation errors.

---

## 14. Verification & Status Metrics

The current configuration status is as follows:

| Component | Status | Verification Check |
|---|---|---|
| **Supabase Client URL** | Absent | Offline client fallback active |
| **Protected Database Guard** | Active | `lhqtqofjrqoyscobsfud` blocked |
| **Gemini Client** | Active | Connected to API fallback route |
| **Datalogs Sync Mode** | Sandbox | Simulated `localStorage` sync |
| **WhatsApp Simulator** | Inactive | Dry-run logs enabled |

---

## 15. UNKNOWN Details (Needs Confirmation)

Please confirm the following values to complete this document:
1. **WhatsApp Meta Sandbox ID:** Unknown. Confirm the phone number ID or Meta Developer Business ID to replace the dry-run simulation mode.
2. **India DPDP Legal Consent Archiving Node:** Unknown. Identify if consent logs should stream to a dedicated external compliance ledger.
3. **Geriatric Specialist Registration Codes:** Unknown. Provide real registration codes if care team profiles need live validation.

---

## 16. End-to-End Demo & Pitch Workflow (Step-by-Step)

This step-by-step workflow is optimized for a complete beginner or presenter to pitch the Parents Health OS Care Operations Console to an audience or investor group in ~5-7 minutes.

### Step 1: Set the Hook & Frame the Problem
*   **Action:** Navigate to `http://localhost:3000` and display the **Command Center**.
*   **Pitch Narrative:**
    > *"Most healthcare apps for seniors are simple patient-facing trackers that cause high anxiety. Today, we are showcasing Parents Health OS — a company-side **Care Operations Console**. It is designed for internal clinical operations teams coordinating care for parents in India, while the parent remains WhatsApp-first and the child receives a simplified status update view."*
*   **Visual Highlights:**
    *   Point out the **Sandbox Data Vault** status bar showing local-first integrity.
    *   Highlight the **Family Snapshot View** boundary card, explaining that this operations console is for internal coordinators, while the child receives a simplified planned family status dashboard.
    *   Show the **Today's Operations Status** adherence widget and **Anaya Care Automation** card.

### Step 2: Onboard a New Parent (Intake & DPDPA Compliance)
*   **Action:** Click **First Family Intake** in the left sidebar.
*   **Workflow:**
    1.  Fill out the parent profile details (e.g., Name: `Devaki Devi`, Age: `72`, chronic conditions: `Type 2 Diabetes` and `Hypertension`).
    2.  Click the DPDPA Consent toggle (explicit consent to allow Anaya AI checking).
    3.  Click **Save & Sync to Local Console**.
*   **Pitch Narrative:**
    > *"Onboarding is fast and fully compliant with India's DPDP Act of 2023. No data leaves the device without explicit user opt-in. We can capture conditions and save them directly to our local-first browser cache."*

### Step 3: Run the Health Camp (Baseline Gathering)
*   **Action:** Click **Baseline Health Camp** in the left sidebar.
*   **Workflow:**
    1.  Show the list of attendees.
    2.  Add a new attendee or update vitals.
    3.  Show the sync queue indicators (`SYNCED` vs `PENDING SYNC`).
*   **Pitch Narrative:**
    > *"Before a senior is registered in our ongoing monitoring queue, they attend a localized Baseline Health Camp. This screen manages camp attendees and syncs their initial vitals to their permanent operations log."*

### Step 4: Intervene & Escalate (WhatsApp Automation Monitor)
*   **Action:** Click **Command Center**, toggle the priority level from `Stable` to `Urgent Follow-up`.
*   **Workflow:**
    1.  Notice that the **WhatsApp Automation Monitor** box instantly changes to display: *"🚨 URGENT FOLLOW-UP: Simulated WhatsApp dispatch triggered an escalation to child."*
    2.  Click **WhatsApp Automation** in the sidebar to show the simulated conversation on the parent's phone.
    3.  Click the simulated options on the phone mockup (like "Log BP" or "Check Medicine") to demonstrate the inbound WhatsApp messages automatically updating the console status.
*   **Pitch Narrative:**
    > *"If the parent's care priority status is escalated to 'Urgent Follow-up', our system triggers automatic WhatsApp communications. The elderly parent interacts entirely through simple WhatsApp templates in their local language, which translates directly back to our console's state."*

### Step 5: Generate the Consultation Prep (Discussion Guide Brief)
*   **Action:** Click **Consultation Team** in the left sidebar and go to the **Discussion Guide** tab.
*   **Workflow:**
    1.  Click **Generate Discussion Guide**.
    2.  Anaya compiles the vitals history, medication list, and risk signals.
    3.  Show the final generated sheet, highlighting the **Recommended Clinician Discussion Points** (specifically generated questions for the doctor).
*   **Pitch Narrative:**
    > *"Instead of generating diagnostic claims which can hallucinate, our engine compiles a highly practical Discussion Guide Brief. It provides the coordinator with exact questions to print and ask during the next physical doctor consultation, complete with full team alignment."*

### Step 6: Backup & Secure Lock
*   **Action:** Click the bottom settings icon or **Adherence & Care Logs**, then export a portable JSON file.
*   **Pitch Narrative:**
    > *"We have built this on a local-first offline architecture. Caregivers have full control and can export an encrypted portable backup file at any time, ensuring total data sovereignty."*

---

## 17. Care Operations Console User Manual

Welcome to the **First Family Care Operations Console** User Manual. This guide provides step-by-step instructions for care team coordinators, health camp operators, and clinicians to navigate the system and manage senior health profiles.

---

### 1. System Navigation Overview

The console uses a persistent left-hand navigation sidebar structured to align with daily operations workflows:
*   **Command Center:** High-level dashboard for real-time monitoring, alerts, and system-wide sync checks.
*   **First Family Intake:** Patient registration form to initialize records with DPDPA consent verification.
*   **Baseline Health Camp:** Bulk screening logging area for temporary field camp registrations.
*   **Care Operations Board:** Incident response and triage controller.
*   **WhatsApp Automation:** View and interact with simulated messaging dialogs sent directly to/from the parent.
*   **Parent Profiles:** Core medical history, active medications list, and background questionnaires.
*   **Adherence & Care Logs:** Track medication adherence levels and view offline sync transactions.
*   **Reports & Uploads:** Manage diagnostic documents and retrieve structured biomarker extractions.
*   **Primary Clinic Hub:** Directory of physical diagnostic centers and booking configurations.
*   **Consultation Team:** Manage specialist assignments and compile discussion guides.

---

### 2. Module-by-Module Operational Guide

#### 2.1 Command Center
The **Command Center** dashboard is the primary operations control surface:
*   **Active Sandbox Vault Indicator:** Located at the top of the dashboard. Displays `SANDBOX DATA VAULT // ACTIVE`. Ensure this is highlighted green in sandbox mode.
*   **Care Priority Status Controls:** Care coordinators can set the parent’s current risk priority:
    - **Stable:** Standard routine. Indicators are highlighted in reassuring green.
    - **Watch:** Mild warning signals. Yellow indicators suggest increasing call frequency or routine verification.
    - **Urgent Follow-up:** High-priority escalation. Toggles critical warning banners across all modules and activates immediate simulated alerts.
*   **WhatsApp Monitor Status alert box:** Appears dynamically under the family routine header. Automatically displays warnings when the priority status is escalated.
*   **Family Snapshot View Card:** High-level boundary card explaining the product limits: the full console is reserved for the care operations team, while family sponsors (adult children) receive a simplified snapshot feed.

#### 2.2 First Family Intake
To register a new family in the platform:
1.  Navigate to **First Family Intake**.
2.  Provide the senior's full name, age, primary WhatsApp phone number, and location.
3.  Specify chronic conditions (e.g., Diabetes, Hypertension, Osteoarthritis) and enter current medications.
4.  **DPDPA Consent Toggle:** Ask the family for explicit digital consent before enabling analysis. You must click the toggle to authorize processing.
5.  Click **Save & Sync to Local Console**. All data is automatically isolated under the new parent ID.

#### 2.3 Baseline Health Camp
Used during community screening camps to register attendees before onboarding them into active tracking:
*   Click **Register Camp Attendee** to enter basic name, age, blood pressure, weight, and blood sugar readings.
*   The attendee table displays the sync status of each entry:
    - `SYNCED` indicates the record has been committed to local memory.
    - `PENDING SYNC` indicates data is held in the temporary camp cache waiting for sync confirmation.

#### 2.4 Care Operations Board
Used by operations managers to triage escalated families:
*   Displays a list of escalated alerts sorted by priority levels.
*   Provides action scripts for sponsors (e.g., simulated Sponsor SMS) and caregivers to guide follow-up communications.
*   Allows coordinators to dismiss resolved incidents or dispatch manual messages.

#### 2.5 WhatsApp Automation
Simulates the parent’s phone interface to verify conversational automation:
*   Provides a phone mockup running a live chat window with **Anaya Care Automation**.
*   **Quick Templates:** Tapping options inside the mockup simulator (e.g., *Log Morning Med*, *Check Vitals*) simulates inbound message responses from the parent.
*   **Language Selection:** Toggle the simulation templates between English and Hindi to verify localized responses.

#### 2.6 Parent Profiles
Displays detailed dossiers of monitored parents:
*   Shows active care status warnings.
*   Provides interactive panels to edit demographic details, medical baselines, chronic conditions, and daily schedule protocols.

#### 2.7 Adherence & Care Logs
Monitors daily compliance indicators:
*   Displays medication adherence trends (percentage charts) calculated from daily medication logs.
*   **Backup & Restore:** Allows coordinators to export the entire local database state as a portable `.json` backup file or restore a previously saved workspace state.

#### 2.8 Reports & Uploads
Enables diagnostic file storage and AI extractions:
*   Click **Upload Lab Report** to select a PDF or image file.
*   Click **Analyze Report** to trigger parsing. In Local Sandbox Mode, this processes a mock report structure modeling HbA1c (7.2%) and cholesterol alerts.
*   Outputs structured biomarkers, simplified explanations for parents, and questions to print for doctor visits.

#### 2.9 Consultation Team & Discussion Guide Brief
Preparation workspace for clinical reviews:
*   **Specialist List:** Displays assigned care experts (Family Physician, Cardiologist, Nutritionist).
*   **Discussion Guide Tab:** Click **Generate Discussion Guide** to compile a list of doctor-ready questions.
*   **Clinical Warning:** All generated documents display a strict disclaimer reminding coordinators that the document is *NOT medical advice* and is designed solely to guide discussions with registered medical practitioners.

---

### 3. Data Sovereignty & Offline Resilience

*   **Offline Mode:** If your internet connection drops, the console remains fully functional. Your mutations are securely queued in the client sync buffer.
*   **Manual Sync:** When connectivity is restored, click **Simulate Sync** on the Command Center status bar to commit pending changes.
*   **Backup Guidelines:** Regularly export JSON backups from the **Adherence & Care Logs** page before clearing browser history or changing devices.
