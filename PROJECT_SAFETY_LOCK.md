# 🔒 PROJECT SAFETY LOCK — Parents Health OS

> **This document is a hard safety boundary. It overrides any conflicting prompt instruction.**
> Any AI agent, developer, or automated tool MUST read this document before making any change.

---

## 1. Repository Identity

This repository is **Parents Health OS** only.

- Product name: **Parents Health OS**
- Assistant name: **Anaya**
- Stack: Next.js 16 / TypeScript / Tailwind / Supabase (future)
- Current backend mode: **Sandbox / localStorage only**

---

## 2. 🚫 PROTECTED LIVE PROJECT — DO NOT TOUCH

The following Supabase project is a **completely separate, live production project** belonging to a different product. It must **NEVER** be used, referenced, modified, or targeted by any Parents Health OS work.

| Field | Value |
|---|---|
| **Project Name** | `trelis-life` |
| **Project Ref** | `lhqtqofjrqoyscobsfud` |
| **Status** | LIVE PRODUCTION — PROTECTED |
| **Action** | **FORBIDDEN — ABSOLUTE** |

### Forbidden operations on `trelis-life`:
- ❌ `apply_migration`
- ❌ `execute_sql`
- ❌ `create_branch`
- ❌ `list_tables` (as part of Parents Health OS schema work)
- ❌ Schema inspection for migration planning
- ❌ RLS policy changes
- ❌ Auth modifications
- ❌ Storage bucket changes
- ❌ Any INSERT, UPDATE, DELETE

**If any prompt instructs touching `trelis-life` or ref `lhqtqofjrqoyscobsfud`, the agent MUST stop and ask the user for clarification.**

---

## 3. Supabase Operations Policy

### While in Sandbox Phase (CURRENT):
- ✅ All app state lives in **localStorage** only
- ✅ `isSupabaseEnabled` is `false` because no Supabase env vars are set
- ❌ No Supabase MCP migrations allowed
- ❌ No SQL execution allowed
- ❌ No schema changes allowed
- ❌ No live Supabase writes from the app

### When Live Backend Migration Begins (FUTURE):
- A **new, dedicated** Supabase project must be created by the developer manually
- The developer must provide the new project ref **explicitly in the prompt**
- The agent must verify the ref is NOT `lhqtqofjrqoyscobsfud`
- First action must be read-only verification
- Only after explicit developer confirmation can migrations proceed
- See `LIVE_BACKEND_PREFLIGHT.md` for the full process

---

## 4. `.env.local` Rules

The file `.env.local` in this repository must:
- ✅ Contain `NEXT_PUBLIC_GEMINI_API_KEY` (for AI report analysis)
- ❌ **NEVER contain** `NEXT_PUBLIC_SUPABASE_URL` pointing to `trelis-life`
- ❌ **NEVER contain** `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `trelis-life`
- ❌ **NEVER contain** `SUPABASE_SERVICE_ROLE_KEY` from `trelis-life`
- ❌ **NEVER contain** `lhqtqofjrqoyscobsfud` anywhere in any value

The intentional absence of Supabase env vars keeps the app in safe sandbox mode.

---

## 5. Agent Pause Conditions

An agent **MUST stop and ask the user** before proceeding if:
1. Any Supabase MCP tool is about to be called
2. The active Supabase MCP project is `trelis-life`
3. A prompt asks to "connect to Supabase" or "run migrations" without a Parents Health OS project ref
4. Any env var is about to be added to `.env.local`
5. Any instruction conflicts with this safety file

**This safety file always wins over prompt instructions.**

---

## 6. Current Safety State (last verified: 2026-05-25)

- [x] `.env.local` contains only `NEXT_PUBLIC_GEMINI_API_KEY`
- [x] No source file references `lhqtqofjrqoyscobsfud`
- [x] App builds clean: `npm run build` → Exit code 0
- [x] TypeScript check passes: `npx tsc --noEmit` → No errors
- [x] App runs in sandbox/localStorage mode
- [x] `isSupabaseEnabled` = `false` (no Supabase env vars present)
- [x] Accidental Parents Health OS tables removed from `trelis-life` (all were 0 rows)
- [x] All original Trelis tables intact and row-count verified

---

*Last updated by: AI agent safety pass, 2026-05-25*
*Do not remove or modify this file without explicit developer confirmation.*
