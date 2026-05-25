# 🤖 AGENT RULES — Parents Health OS

> Operational instructions for all AI IDE agents working in this repository.
> Read this file FIRST, before reading any other file or executing any task.

---

## RULE 0 — Read Safety Lock First

**Before making any change, read `PROJECT_SAFETY_LOCK.md`.**
If it cannot be found, stop and ask the developer before proceeding.

---

## RULE 1 — Never Touch trelis-life

```
FORBIDDEN PROJECT:  trelis-life
FORBIDDEN REF:      lhqtqofjrqoyscobsfud
```

- Never call `apply_migration` with project_id `lhqtqofjrqoyscobsfud`
- Never call `execute_sql` with project_id `lhqtqofjrqoyscobsfud`
- Never call `create_branch`, `merge_branch`, `reset_branch` on `lhqtqofjrqoyscobsfud`
- Never list tables, inspect schema, or read logs from `lhqtqofjrqoyscobsfud` as part of Parents Health OS work
- If the Supabase MCP active/only project is `trelis-life` → **STOP. Tell the developer. Do not proceed.**

---

## RULE 2 — Supabase Operations Require Explicit Confirmation

Before calling ANY Supabase MCP tool:
1. Confirm the developer has provided a Parents Health OS project ref **in the current prompt**
2. Verify that ref is NOT `lhqtqofjrqoyscobsfud`
3. Confirm the operation type (read-only vs. write) with the developer
4. Never assume the active MCP project is the correct one

**Default state: No Supabase MCP operations.** The app is sandbox-only until the developer explicitly initiates live backend migration.

---

## RULE 3 — Sandbox Mode Must Be Preserved

- `isSupabaseEnabled` must remain `false` while no Supabase env vars are set
- Never add `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- Never add `SUPABASE_SERVICE_ROLE_KEY` from `trelis-life` to `.env.local`
- localStorage-based sandbox behavior must not be broken by any code change
- The `WHATSAPP_DRY_RUN=true` flag must remain active unless explicitly changed

---

## RULE 4 — No Live DB Writes During Sandbox Phase

- The app must not write to any live Supabase database
- All user data must persist in localStorage during sandbox phase
- API routes (`/api/analyze`, `/api/whatsapp/*`) must remain mock/dry-run unless explicitly upgraded

---

## RULE 5 — Feature Work Must Not Break Safety Abstractions

When adding new features:
- Always check the `isSupabaseEnabled` flag before any Supabase call
- Always provide a localStorage fallback for every data operation
- Never hardcode Supabase project refs in source code
- Never log sensitive health data to console in production

---

## RULE 6 — .env.local Integrity

Before writing anything to `.env.local`:
1. Read the current file
2. Confirm the developer has requested the specific key
3. Never paste keys from `trelis-life`
4. Never paste Supabase credentials until a dedicated Parents Health OS project exists

---

## RULE 7 — Before Each Session

Quick pre-flight checklist (run read-only):
- [ ] Does `.env.local` contain `lhqtqofjrqoyscobsfud`? → If yes, STOP
- [ ] Does any source file reference `lhqtqofjrqoyscobsfud`? → If yes, alert developer
- [ ] Is the task asking for Supabase operations without an explicit Parents Health OS ref? → If yes, ask first
- [ ] Does `npm run build` pass? → If no, fix compile errors before feature work

---

## RULE 8 — When In Doubt

**Ask first. Never assume.**

If a prompt is ambiguous about which Supabase project to use, which environment to target, or whether a database operation is safe — stop and ask the developer before proceeding.

---

*This file is a durable operational contract. Do not remove or modify without explicit developer confirmation.*
