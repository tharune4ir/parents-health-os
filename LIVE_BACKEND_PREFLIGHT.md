# 🚀 LIVE BACKEND PREFLIGHT — Parents Health OS

> This document describes the exact process for connecting Parents Health OS
> to a real Supabase backend when the time comes. Follow every step in order.
> Do not skip steps. Do not deviate.

---

## Current Status: SANDBOX MODE ✅

The app currently runs in **localStorage / sandbox mode**.
No live Supabase project is connected. This is safe and intentional.

---

## Step-by-Step Live Backend Migration Process

### Step 1 — Developer Creates a Dedicated Supabase Project (Manually)

> **You must do this yourself. Do not ask the AI agent to create the project.**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Choose your organization
4. Set project name: **`parents-health-os`** (or similar — NOT `trelis-life`)
5. Set region: **`ap-south-1` (Mumbai, India)** — for DPDP compliance
6. Set a strong database password and save it securely
7. Wait for the project to initialize (~2 minutes)
8. Note the **Project Ref** (format: `xxxxxxxxxxxxxxxxxxxx`) — you will need this

> ⚠️ If the project ref matches `lhqtqofjrqoyscobsfud` — something went wrong. Stop immediately.

---

### Step 2 — Verify the New Project Ref

Before providing the ref to the AI agent, double-check:

- [ ] Project name is `parents-health-os` (not `trelis-life`)
- [ ] Project ref does NOT start with or equal `lhqtqofjrqoyscobsfud`
- [ ] The project is a fresh project with no existing tables
- [ ] You are the owner of this project

---

### Step 3 — Provide the Ref Explicitly in Your Prompt

When starting the live backend migration session, your prompt must contain:

```
The new Parents Health OS Supabase project ref is: [YOUR_NEW_REF_HERE]
Please verify this is not trelis-life, then proceed with read-only verification first.
```

The AI agent will:
1. Verify the ref is NOT `lhqtqofjrqoyscobsfud`
2. Run `list_tables` (read-only) to confirm the project is empty
3. Report findings to you
4. Wait for your explicit "proceed with migrations" confirmation

---

### Step 4 — Read-Only Verification First

The AI agent must perform these read-only checks BEFORE any migrations:

- [ ] Confirm project ref ≠ `lhqtqofjrqoyscobsfud`
- [ ] Confirm project name contains "parents" or "health" (not "trelis")
- [ ] Confirm `public` schema is empty (no existing tables)
- [ ] Confirm no auth users exist yet
- [ ] Report all findings to developer

**Only after your explicit "proceed" confirmation can migrations begin.**

---

### Step 5 — Apply Migrations

Migrations will be applied in this order:
1. Core schema (families, parents, profiles)
2. Health data (vitals, medications, medication_logs, lab_reports)
3. Communication (whatsapp_messages, ai_conversations)
4. RLS policies
5. Triggers and functions

Each migration will be run one at a time with confirmation between steps.

---

### Step 6 — Add Credentials to `.env.local`

After migrations are verified:

1. Go to Supabase Dashboard → Project Settings → API
2. Copy the **Project URL** and **anon/public key**
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   ```
4. The `SUPABASE_SERVICE_ROLE_KEY` is only needed for server-side operations
5. Never commit `.env.local` to git

> ⚠️ Triple-check: The URL must NOT contain `lhqtqofjrqoyscobsfud`.

---

### Step 7 — Verify App Switches to Live Mode

After adding env vars:

- [ ] `npm run dev` → App starts
- [ ] `isSupabaseEnabled` becomes `true`
- [ ] Login/signup flow works
- [ ] Onboarding creates a family and parent record
- [ ] Vitals and medications save to Supabase (not localStorage)
- [ ] Run `npm run build` → Exit code 0

---

## Safety Reminders

| Rule | Status |
|---|---|
| `trelis-life` is NEVER used for Parents Health OS | PERMANENT |
| Ref `lhqtqofjrqoyscobsfud` is NEVER targeted | PERMANENT |
| Sandbox mode is preserved until this checklist is complete | ACTIVE |
| `.env.local` must not contain Trelis credentials | PERMANENT |

---

*See also: `PROJECT_SAFETY_LOCK.md` | `AGENT_RULES.md`*
