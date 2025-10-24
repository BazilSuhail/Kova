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
├─ app/            expo-router routes; each route file owns its screen
├─ components/     auth, domain, navigation and UI primitives
├─ config/         theme tokens and environment config
├─ constants/      shared option lists and category tones
├─ lib/            API client and hooks, formatting, storage, validation
├─ providers/      theme, auth, query and push providers
├─ store/          auth state
└─ theme/          icon name types
```

Each route under `src/app` contains the full implementation of its screen. Shared
presentational pieces live in `src/components`; shared logic lives in `src/lib`.

## Navigation

Bottom tab bar — **Home · Tasks · Plan · Insights · Profile** — with an animated active
indicator, swipeable pager, and tabs that mount on first visit.

## Theming

The design system is two brand greens on neutral surfaces:

- Forest `#123F36` is the primary fill and light-mode heading.
- Pine `#2A6B5C` is the secondary fill and light-mode body text.
- Backgrounds are white and true neutral grays in light mode; near-black and neutral grays in
  dark mode.

Every colour is a semantic token. `global.css` declares the Uniwind palette and the light/dark
values; `src/config/theme.ts` mirrors those values for JavaScript consumers such as Ionicons
`color`, chart strokes, and the skeleton shimmer. Components use semantic classes
(`bg-surface`, `text-body`, `border-border`) and never a `dark:` variant.

Theme choice — light, dark, or system — is persisted by
`src/providers/theme-provider.tsx` under `@kova/theme` and exposed through `useTheme()`.
`useThemeColors()` and `useIsDark()` come from `src/config/theme.ts`.

See **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** for the full token and contrast reference.

## Roadmap

See **[ROADMAP.md](ROADMAP.md)** — phased plan from foundations to full v1, with the screen →
endpoint mapping for the 75-endpoint API.

---

Built for students who want to plan, reflect, and grow.
