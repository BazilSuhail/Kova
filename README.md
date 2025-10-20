# Kova — Mobile Client

**Kova** is a Personal AI Life Assistant for students: plan, prioritise, reflect, and grow with
natural-language tasks, voice capture, mood-aware suggestions, smart reminders, and offline sync.

This repository is the **React Native + Expo** client. It talks to the
**[Kova server](https://github.com/BazilSuhail/ZenFlow-Server)** (Flask + MongoDB, 75 endpoints).

---

## Tech stack

| | |
|---|---|
| Runtime | Expo SDK 57 · React Native 0.86 · React 19 |
| Routing | expo-router (file-based) |
| Styling | **Uniwind** (Tailwind CSS v4 for React Native) |
| Icons | `@expo/vector-icons` (Ionicons) |
| Animation | React Native `Animated` (Reanimated available) |
| Language | TypeScript (strict) |

## Getting started

```bash
bun install          # or npm install
cp .env.example .env # then set EXPO_PUBLIC_API_URL
bun start            # or: bun run android | bun run ios | bun run web
```

### Environment

`.env` is git-ignored; `.env.example` documents the keys.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the Kova API (no trailing `/api`) |

Common values: `http://127.0.0.1:5000` (local) · `http://10.0.2.2:5000` (Android emulator) ·
`http://<lan-ip>:5000` (physical device).

### Scripts

| Command | Does |
|---|---|
| `bun start` | Start the Expo dev server |
| `bun run android` / `ios` / `web` | Start on a specific platform |
| `bun run lint` | ESLint (expo config) |
| `bunx tsc --noEmit` | Type-check |

## Project structure

```text
src/
├─ app/            expo-router entry + layouts
├─ components/     tab bar, theme toggle, shared UI
├─ screens/        screen implementations
├─ hooks/          reusable hooks (persisted theme)
└─ theme/          theme-aware colour tokens for icons & charts
```

## Navigation

Bottom tab bar — **Home · Tasks · Plan · Insights · Profile** — with an animated active
indicator, swipeable pager, and tabs that mount on first visit.

## Theming

Light and dark are handled by **plain Tailwind classes** via Uniwind (`bg-white dark:bg-slate-900`) —
there is no custom colour palette to configure. The only raw colour values live in
`src/theme/colors.ts`, used by `useThemeColors()` for APIs that can't take a `className`
(Ionicons `color`, chart strokes). Accent policy: violet = brand/primary/AI,
emerald = success/streak, red/amber = danger/warning.

## Roadmap

See **[ROADMAP.md](ROADMAP.md)** — phased plan from foundations to full v1, with the screen →
endpoint mapping for the 75-endpoint API.

---

Built for students who want to plan, reflect, and grow.
