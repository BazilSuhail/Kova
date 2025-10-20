# Kova — Client Build Roadmap

React Native · Expo SDK 57 · expo-router · **Uniwind** (Tailwind v4) · `@expo/vector-icons`
Server contract: **75 endpoints** — see [`ZenFlow-Server/docs/client.md`](../ZenFlow-Server/docs/client.md)

**Approach:** plain Tailwind via Uniwind — no custom palette in `global.css`. Violet = brand/primary/AI,
emerald = success/streak, slate = neutral, red/amber = danger/warning. Icons come from
`@expo/vector-icons` (Ionicons); icon/chart colours come from `useThemeColors()` in `src/theme/colors.ts`.

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
Row, Screen), loading/empty/error states. Screens live in `src/screens/` with thin route files under `src/app/`.
Theme preference hoisted into `ThemeProvider` so the stored choice applies before the first paint.

## Phase 3 — MVP screens (~40/75 endpoints) — next
Home/Dashboard · Tasks (list/search/filter/paging, create, detail + subtasks, AI/voice/scan capture,
categorize, title-rewrite) · Planner · Notifications · Profile (edit/avatars/password/delete-cascade).
Handle `415` / `502` / `503` and the task-`PUT` 404-on-no-op + planner-`PUT` 200-on-no-op quirks.

## Phase 4 — Full v1 + polish
Insights (Progress, Suggestions, Mood & Journal, Summaries) · Plan (Calendar, Reminders, Recaps) ·
push via `expo-notifications` → `/api/devices/` · offline `sync/pull` + `push` · animations/haptics/a11y ·
EAS build + Kova icons/splash · align `docs/client.md` with the plain-Tailwind approach.

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
