# Kova — Client Build Roadmap

React Native · Expo SDK 57 · expo-router · **Uniwind** (Tailwind v4) · `@expo/vector-icons`
Server contract: **75 endpoints** — see [`ZenFlow-Server/docs/client.md`](../ZenFlow-Server/docs/client.md)

**Approach:** plain Tailwind via Uniwind — no custom palette in `global.css`. Violet = brand/primary/AI,
emerald = success/streak, slate = neutral, red/amber = danger/warning. Icons come from
`@expo/vector-icons` (Ionicons); icon/chart colours come from `useThemeColors()` in `src/theme/colors.ts`.

**Coverage:** every screen-facing route is wired. The one exception is the offline `sync/push` queue,
which exists in `src/api/sync.ts` but nothing enqueues into it (see Phase 4 "Deferred").

---

## Phase 0 — Foundations ✅ done
- Rebrand → Kova: `app.json` (`name`, `slug`, `scheme: kova`), `package.json` (`kova-app`), `@kova/theme` key.
- Icons: dropped `@react-native-vector-icons/*` (font was never linked → blank glyphs) for `@expo/vector-icons`.
- Tabs reconciled to **Home · Tasks · Plan · Insights · Profile** (`todo→tasks`, `focus→plan`), outline→filled active icons.
- Accent: violet accent via plain Tailwind; removed the undefined utilities (`bg-muted`, `text-primary`,
  `text-muted-foreground`, `text-warning`) and all hardcoded icon hex.
- `global.css` reduced to `@import 'tailwindcss'` + `@import 'uniwind'`.
- Tabs lazy-mount on first visit (no boot-time queries for unopened tabs).
- `EXPO_PUBLIC_API_URL` in `.env` (ignored) + `.env.example` (tracked); `.gitignore` rewritten for Expo/RN.

## Phase 1 — Integration core ✅ done
`expo-secure-store`, `@tanstack/react-query`, `zustand`, `zod` · `api/client.ts` (bearer, **401 → refresh + rotation**,
429 `Retry-After`, error normalisation, `Server-Timing`/`X-Request-ID`) · secure token store + `AuthProvider`
+ auth gate + splash · `QueryProvider` · welcome / login / signup / permissions.
**Endpoints:** `signup`, `login`, `refresh`, `logout`, `me`.

## Phase 2 — Navigation shell ✅ done
expo-router adopted: `(auth)` / `(tabs)` groups, a `<Stack>` per tab, modal routes, declarative `Stack.Protected`
gating, animated custom `tabBar`, UI kit (Card, Button, Input, Chip, Sheet, EmptyState, ErrorState, Skeleton, FAB,
Row, Screen), loading/empty/error states. Each screen lives in its route file under `src/app/`.
Theme preference hoisted into `ThemeProvider` so the stored choice applies before the first paint.

## Phase 3 — MVP screens ✅ done
- **Home** on `GET /api/dashboard/` + `GET /api/daily-recap/`: completion ring, due-today and streak tiles,
  today's tasks with optimistic ticks, recap card, next reminders, suggestions, unread bell badge.
- **Tasks**: debounced search, All/Open/Done filters, category chips, paging, pull to refresh, optimistic
  complete and delete, skeleton/empty/error states.
- **Captured tasks**: typed form (with `suggest-title` on demand), natural language
  (`create/natural-language`), voice notes (`create/voice`) and photo scans (`create/image`).
- **Task detail**: edit only the changed fields, complete, `rewrite-title`, `categorize`, generate steps from
  the description, toggle and delete steps, delete the task.
- **Notifications**: unread filter, mark read on tap, hold to remove, paging, empty/error states.
- Quirk handling: task `PUT` answers 404 on a no-op, so toggles keep the optimistic value and edits skip
  an unchanged draft; `415` / `502` / `503` surface the server's own wording.
- **Endpoints (19 added):** dashboard, daily-recap, tasks list/get/create/update/delete,
  `suggest-title`, `create/natural-language`, `categorize`, `rewrite-title`, subtasks list/create/update/delete
  (single and per task), notifications list/update/delete.

**Follow-ups landed with Phase 4:** voice + scan capture (multipart), category filter chips,
planner, profile editing, avatar catalogue, password change, delete account.

## Phase 4 — Full v1 ✅ done

**Insights**
- Progress tab: completion rate, current/longest streak, active days, a seven-day load balance chart,
  achievement bars, top suggestions, and the Reflect shortcuts.
- Suggestions: one card per nudge with a priority pill and a type icon.
- Mood: six-label check-in with an energy stepper, live load guidance from `mood/suggestions`, tags and a
  note; trends over 7/30/90 days with a distribution and a dependency-free daily bar chart; full history
  with long-press delete.
- Journal: today's prompt and affirmation, write or replace today's entry, earlier entries with detail
  and delete.
- Summaries: create from a note (≥20 characters) or a PDF upload, infinite list, detail with numbered
  bullets, edit, convert to a task, delete.

**Plan**
- Today: focus list (add/remove), linked tasks with completion, reflection, day numbers, quick links.
- Editor: 14-day chooser (plus the previous fortnight), focus chips, linked open tasks, reflection,
  create/update/delete for one day.
- Calendar: day, week and month views with stepping, a month grid with task dots and today's ring.
- Reminders: 48-hour lookahead, pending/sent filters, create with a day + half-hour time chooser
  (local time converted to an instant), confirm-and-delete.
- Weekly recap: range stepping, totals, per-day completion bars and a card per day (reflection joined
  by date from the planner).

**Profile**
- Identity header with a real avatar (server-relative paths resolved through `assetUrl`), progress stats,
  grouped rows, sign out.
- Edit name/email/preferences, avatar catalogue with highlight and remove, settings (appearance, text
  size, layout, notifications, language) saved per key with an optimistic overlay, registered devices,
  manual sync with a `since` cursor, password change, delete account (type-to-confirm).
- `about` refreshed to describe the shipped app.

**Cross-cutting**
- Push: permission, Android channel, Expo token → `POST /api/devices/` on every launch (re-owns the
  token), foreground refresh of the bell, tap → `/notifications`. Web is guarded out.
- Haptics: tab presses, task completion, task creation, deletes, mood picks and destructive confirms.
- Navigation: every pushed screen carries a header back control (`BackButton`, with a cold-deep-link
  fallback).
- Build: `eas.json` (development/preview/production, `appVersionSource: remote`, preview APK), iOS bundle
  id and Android package `com.kova.app`, permission copy for microphone, camera and photos.
- `docs/client.md` (server repo) now documents Tailwind + Uniwind instead of the "Zenith Aura" tokens.

**Verification:** `tsc --noEmit` clean · `eslint . --max-warnings 0` clean · `expo export --platform web`
and `--platform android` both succeed.

**Deferred**
- Offline mutation queue. `sync/push` exists in the API layer but nothing enqueues changes; the app is
  honest about it on the Sync screen (a failed write is retried by the user, and a pull repairs caches).
- Push tokens need an EAS project (`eas init`) before a device can register outside Expo Go.
- No automated tests on the client, and no deployed server: `.env` still points at `127.0.0.1`, so a
  physical device needs `EXPO_PUBLIC_API_URL` set to the host's LAN address.

---

## Target structure

```text
src/
├─ app/          expo-router routes only: _layout · (auth)/ · (tabs)/[home|tasks|plan|insights|profile]/
├─ api/          client.ts + one module per server blueprint (auth, tasks, planner, mood, …)
├─ components/   ui/ · navigation/ · domain/
├─ providers/    Query · Auth · Sync · Theme
├─ store/        zustand: auth, syncQueue, ui
├─ hooks/ lib/ theme/ constants/
```
