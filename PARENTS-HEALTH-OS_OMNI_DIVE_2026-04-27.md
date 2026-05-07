# PARENTS HEALTH OS: OMNI-DIVE REPORT [2026-04-27]

## 1. Executive Core Identity & Moat
- **What is this project?**: A high-fidelity "Care Companion" prototype designed to demonstrate how clinical health data becomes actionable only when synthesized with granular, daily personal routine context for seniors.
- **The Core Thesis & Moat**: Parents Health OS posits that "Health data is most helpful when paired with personal routine context." Its moat lies in the **Longitudinal Synthesis Layer**—the ability to correlate high-frequency daily habit logs (meds, vitals, mood) with low-frequency clinical data (lab reports, prescriptions) through a warm, respectful AI persona ("Nani-Bot"). This transforms a clinical dashboard into a proactive "Care Companion" that understands the *why* behind health trends.
- **North Star Metric**: **Routine Synchronization Index (RSI)**. Unlike competitors who measure total data points or screen time, Parents Health OS measures the delta between the "Prescribed Protocol" (medication schedules, vital targets) and the "Actual Daily Log."

## 2. Technical Architecture & Stack
- **Core Framework**: `Next.js 16.1.4` (App Router) for high-performance server-side rendering and routing.
- **Runtime & Language**: `Node.js 20+` with `TypeScript 5+` for strict type safety across clinical data structures.
- **UI & Logic Architecture**: `React 19.2.3` utilizing `motion-dom` (`Framer Motion 12.2`) for premium, fluid micro-interactions.
- **Styling System**: `Vanilla CSS` for deep design control combined with `Tailwind CSS 4.0` utilities for efficient layout.
- **AI Intelligence**: `Google Gemini 2.0/2.5 Flash` (Primary) with fallback to `gemini-2.5-flash-lite` for report synthesis and document analysis.
- **Data Persistence**: Privacy-centric `localStorage` implementation for local-only prototype data handling.
- **Key Dependencies**: `@google/generative-ai`, `lucide-react` (iconography), `react-dropzone` (file ingestion), `react-markdown`.

### Data Architecture & Local Registry
Parents Health OS v3.4 utilizes a browser-based local persistence model to ensure data privacy for the prototype:

| Key | Type | Purpose |
|:---|:---|:---|
| `parents_health_auth_v2` | Boolean | Initialization flag for the demo. |
| `parents_health_user_name` | String | Sample user identity for the dashboard. |
| `parents_health_assessment_data_v2` | Object | `{ answers: Record<id, label>, scores: Object }`. |
| `parents_health_active_meds` | Array | Sample medication list (Dose, timing, type). |
| `parents_health_history` | Array | Archival memory of analyzed demo reports. |
| `parents_health_latest_summary` | Object | The most recent AI synthesis summary. |
| `parents_health_daily_log_YYYY-MM-DD`| Object | `{ meds: string[], vitals: Vitals, habits: Habits }`. |


## 3. The Math, Algorithm, & Core Logic
- **Weighted Assessment Engine**: The "Clinical Engine" utilizes a 15-question protocol with specific weights to generate a "Sample Health Index" (Max Score: 175).

#### The Assessment Protocol Dictionary (High-Fidelity Logic)
| ID | Dimension | Assessment Question | Weight (Low -> High) |
|:---|:---|:---|:---|
| q1 | Resilience | Age of the member? | <40 (0) to 70+ (15) |
| q2 | Metabolic | High blood sugar/Prediabetes? | No (0) to Diabetes (15) |
| q3 | Cardio | Heart issues (BP/Stent/Cholesterol)? | No (0) to Severe (15) |
| q4 | Resilience | Tired/Breathless during activities? | Never (0) to Often (10) |
| q5 | Cognitive | Stroke/Tremors/Weakness? | No (0) to Diagnosed (10) |
| q6 | Cognitive | Confusion/Forgetfulness? | No (0) to Often (10) |
| q7 | Resilience | Hospitalization/Major Surgery/Cancer? | No (0) to Multiple/Major (10) |
| q8 | Muscular | Joint/Back/Knee pain? | No (0) to Severe (20) |
| q9 | Frailty | Falls/Fractures in last 2 years? | No (0) to Multiple (10) |
| q10| Frailty | Need help with stairs/bathing/dressing?| No (0) to Often (10) |
| q11| Digestive | Bloating/Acidity/Gut issues? | No (0) to Frequently (10) |
| q12| Emotional | Stress/Anxiety/Low mood? | No (0) to Often (10) |
| q13| Sleep | Poor sleep/Snoring/Daytime napping? | Good (0) to Often (10) |
| q14| Lifestyle | Unhealthy eating/Dehydration? | No (0) to Often (10) |
| q15| Lifestyle | Smoking/Alcohol/Zero exercise? | None (0) to 2+ habits (10) |

- **Classification Logic**:
    - `0 - 20`: **Healthy Baseline** (Green)
    - `21 - 40`: **Moderate Attention** (Amber)
    - `41+`: **High Risk / Support Needed** (Red)

- **AI Synthesis Logic**:
    - **Prompt Filtering**: Gemini logic is instructed to "Filter Noise" by implicitly ignoring unrelated history entries.
    - **Biomarker Correlation**: The system correlates extracted lab values (e.g., HbA1c) with the patient's Clinical Profile (e.g., Diabetes risk score) to generate a "patientRiskProfile" JSON output.
- **Routine Matrix**: Tracks consistency via a `History Matrix` (Green: Full completion, Amber: Partial, Red: No data).

## 4. Psychology, Domain Reality & Target User
- **Specific Target User**: Indian Seniors (often referred to as "Nani/Dadi" in the code) and their primary caregivers/doctors.
- **Psychological Framework**: **"Warm Respect" (Sanskaar-UX)**. The system uses culturally resonant greetings ("Namaste") and a respectful persona ("Nani-Bot") to reduce the friction of technology adoption among seniors.
- **Domain Reality**: Senior health is not a series of snapshots; it is a management of longitudinal routines. The system focuses on "Routine Adherence" rather than just "Data Capture."
- **Learning Loops**: The "Daily Care Reminder" triggers at 09:00, 13:00, and 21:00, creating a Pavlovian habit loop for health logging.

## 5. Philosophical Constraints (The Red Lines)
- **Anti-Diagnostic**: The system strictly refuses to provide medical diagnoses; it is a "Care Companion," not a doctor.
- **Privacy First**: No central database. All data is restricted to the user's browser `localStorage`.
- **Anti-Clinical Language**: Refuses to use terms like "Engine," "Diagnostics," or "Command" in user-facing UI. Instead, it uses "Support," "Summary," and "Routine."
- **No Manual-Only Dependency**: While it allows manual entry, the system prioritizes "Device Sync" (Simulated CGM/Watch) to reduce cognitive load for seniors.

## 6. Core Workflows & UX Signal
- **Primary Workflows**:
    1. **Profiling**: Assessment Hub -> Multi-category scoring -> Risk Profile Generation.
    2. **Log & Sync**: Daily Routine Log -> IoT Sync (Simulated FreeStyle Libre/Apple Watch) -> Completion Matrix.
    3. **AI Synthesis**: Document Upload -> Gemini Analysis -> Holistic Smart Report.
    4. **Intervention**: Scheduled Care Reminders -> WhatsApp Interface -> Physician Notification.
- **UX Vibe**: **"Neural Glass"**. High-fidelity glassmorphism with deep space voids (`#010413`), subtle cyan accents, and blurred atmospheric glows. It feels premium, calm, and expensive—designed to instill trust.

## 7. Business Model & External Integrations
- **Monetization Strategy (Demo)**:
    - **Praan Wallet**: A prepaid system for booking specialist "Call Slots" or health services (e.g., ₹1,250 balance).
    - **Health Shield**: Demonstration of a premium insurance node (Policy: YUK-8829-X).
- **AI Integrations**:
    - **Gemini 2.0 Flash**: Used for ELI5 (Explain Like I'm 5) medical report synthesis.
    - **Document Classifier**: Identifies "Lab Report," "Prescription," or "Scan" from image uploads.
- **External Simulation**: Simulated Bluetooth/IoT sync for CGM (Blood Sugar) and Smart Watches (Activity/Weight).

## 8. Builder Proof Points
- **Full-Stack Engineering**: Mastery of Next.js 16/React 19, complex state-driven UI (Log Matrix, Calendar history), and local persistence architectures.
- **AI/Prompt Engineering**: Implementation of multi-mode AI analysis (Summary vs. Document Analysis) with robust fallback systems and JSON-strict output requirements.
- **Product Architecture**: Design of a complex health scoring algorithm (175-point weighted matrix) and a multi-channel care model (Web Dashboard + WhatsApp + Care Team).
- **Design Excellence**: Creation of a custom "Neural Glass" design system that balances technical sophistication with senior-friendly accessibility.

---
*Generated by Antigravity OMNI-CONTEXT EXTRACTION (V2)*
