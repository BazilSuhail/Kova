# Kova Design System

Two brand greens, true neutrals, and nothing else. Every surface and foreground is a semantic
token with a light and a dark value, so components never need `dark:` variants.

| role | light | dark |
| --- | --- | --- |
| Brand — Forest | `#123F36` | fill via Pine |
| Brand — Pine | `#2A6B5C` | `#2A6B5C` |
| Canvas | `#FFFFFF` | `#0A0A0A` |
| Raised surface | `#FFFFFF` | `#171717` |
| Inset surface | `#F5F5F5` | `#262626` |
| Hairline | `#E5E5E5` | `#525252` |

Light mode puts Forest and Pine on white and neutral gray. Dark mode keeps the greens as fills
with white ink, while text and icons on neutral surfaces switch to neutral gray so every pairing
stays readable.

---

## 1. Where the tokens live

| file | role |
| --- | --- |
| `global.css` | Uniwind/Tailwind source of truth: raw palette, semantic custom properties, and the light/dark token blocks. Generates `bg-*`, `text-*`, `border-*` utilities. |
| `src/config/theme.ts` | Typed JS mirror: `palette`, `themes.light`, `themes.dark`, `spacing`, `radii`, `controlSizes`, `useThemeColors()`, `useIsDark()`. Used where a real colour value is required: Ionicons `color`, charts, shadows, animated styles. |
| `src/providers/theme-provider.tsx` | Persists light/dark/system under `@kova/theme` and drives `Uniwind.setTheme`. |

No raw hex belongs outside those files.

### Theme scope

`global.css` resolves the semantic tokens inside `@layer theme`:

```css
@theme {
  --color-forest: #123f36;
  --color-pine: #2a6b5c;
  /* neutral scale */
}

@layer theme {
  :root {
    @variant light {
      --color-surface: #ffffff;
      --color-body: #2a6b5c;
    }
    @variant dark {
      --color-surface: #171717;
      --color-body: #d4d4d4;
    }
  }
}
```

A component writes `bg-surface text-body border-border` once and both themes follow.

---

## 2. Semantic tokens

### Surfaces and lines

| token | utility | light | dark | notes |
| --- | --- | --- | --- | --- |
| `background` | `bg-background` | `#FFFFFF` | `#0A0A0A` | page canvas |
| `surface` | `bg-surface` | `#FFFFFF` | `#171717` | cards, sheets, inputs |
| `surface-alt` | `bg-surface-alt` | `#F5F5F5` | `#262626` | icon tiles, inset panels, tracks |
| `on-surface-alt` | `text-on-surface-alt` | `#123F36` — 10.76:1 | `#E5E5E5` — 12.01:1 | ink on `surface-alt` |
| `border` | `border-border` | `#E5E5E5` | `#525252` | hairlines and dividers |
| `focus` | `border-focus` | `#2A6B5C` — 6.26:1 | `#D4D4D4` — 12.09:1 | focused input outline |

### Ink

| token | utility | light | dark | light contrast | dark contrast |
| --- | --- | --- | --- | --- | --- |
| `heading` | `text-heading` | `#123F36` | `#F5F5F5` | 11.73:1 on white | 16.44:1 on surface |
| `body` | `text-body` | `#2A6B5C` | `#D4D4D4` | 6.26:1 on white | 12.09:1 on surface |
| `muted` | `text-muted` | `#525252` | `#A3A3A3` | 7.81:1 on white | 7.11:1 on surface |
| `danger-ink` | `text-danger-ink` | `#123F36` | `#F5F5F5` | 11.73:1 on white | 16.44:1 on surface |

### Brand and accent

| token | utility | light | dark | notes |
| --- | --- | --- | --- | --- |
| `brand` | `bg-brand` | `#123F36` | `#2A6B5C` | primary fill, progress, selected controls |
| `brand-ink` | `text-brand-ink` / `border-brand-ink` | `#123F36` | `#E5E5E5` | brand-coloured text and outlines that must stay legible on neutral surfaces |
| `on-brand` | `text-on-brand` | `#FFFFFF` — 11.73:1 | `#FFFFFF` — 6.26:1 | ink and icons on `brand` |
| `accent` | `bg-accent` | `#2A6B5C` | `#2A6B5C` | secondary fill |
| `on-accent` | `text-on-accent` | `#FFFFFF` — 6.26:1 | `#FFFFFF` — 6.26:1 | ink on `accent` |

Green is a fill in dark mode. Pine on the near-black canvas is only 3.16:1 and lower on raised
surfaces, so dark-mode text, icons, and outlines use `brand-ink` / the neutral ink tokens
instead. The greens still carry every primary and secondary fill.

### Navigation

| token | utility | light | dark |
| --- | --- | --- | --- |
| `nav` | `bg-nav` | `#123F36` | `#2A6B5C` |
| `on-nav` | `text-on-nav` | `#FFFFFF` | `#FFFFFF` |
| `nav-active` | `bg-nav-active` / `text-nav-active` | `#FFFFFF` | `#FFFFFF` |
| `nav-muted` | `text-nav-muted` | `#E5E5E5` - 9.30:1 | `#E5E5E5` - 4.97:1 |

The tab bar stays Forest in both themes, with a white active bubble and Forest icon on top.

### State fills

| tone | fill utility | light fill / ink | dark fill / ink |
| --- | --- | --- | --- |
| info | `bg-info` / `text-on-info` | `#F5F5F5` / `#123F36` — 10.76:1 | `#262626` / `#E5E5E5` — 12.01:1 |
| success | `bg-success` / `text-on-success` | `#123F36` / `#FFFFFF` — 11.73:1 | `#2A6B5C` / `#FFFFFF` — 6.26:1 |
| warning | `bg-warning` / `text-on-warning` | `#525252` / `#FFFFFF` — 7.81:1 | `#525252` / `#FFFFFF` — 7.81:1 |
| danger | `bg-danger` / `text-on-danger` | `#171717` / `#FFFFFF` — 17.93:1 | `#404040` / `#FFFFFF` — 10.37:1 |

The state tones stay inside the brand-plus-neutral palette on purpose. “Danger” is communicated
by weight and iconography, not by introducing a second hue.

---

## 3. Contrast rules

AA requires **4.5:1** for normal text and **3:1** for large text and meaningful UI graphics.

Safe pairings used by the library:

- Forest on white **11.73:1** and on gray-100 **10.76:1**.
- Pine on white **6.26:1**; white on Forest **11.73:1** and Pine **6.26:1**.
- Gray-600 on white **7.81:1**; gray-600 on gray-100 **7.17:1**.
- Gray-100 on `#171717` **16.44:1**; gray-300 on `#171717` **12.09:1**; gray-400 on `#262626`
  **6.00:1**.
- White on warning gray-600 **7.81:1**; white on danger gray-700 **10.37:1**.

Pairings to avoid:

- Pine text on `#171717` (2.87:1) or `#262626` (2.42:1). Use `brand-ink` or a neutral ink.
- Forest ink on Forest or Pine fill. Use `text-on-brand`.
- Any stock Tailwind colour (`slate-*`, `violet-*`, `emerald-*`, `red-*`, `amber-*`, …).

React Native does not inherit text colour from a parent `View`. Put an explicit ink class on the
text inside a coloured surface.

---

## 4. Usage rules

**Do**

- Use semantic utilities: `bg-surface`, `text-body`, `border-border`, `bg-brand`,
  `text-on-brand`.
- Use `text-heading` for headings, `text-body` for prose, `text-muted` for metadata.
- Use `useThemeColors()` only where a raw colour is unavoidable (icon `color`, chart strokes,
  animated values). It follows the persisted light/dark theme.
- Use `brandInk` and `successInk` for icon ink on neutral surfaces in both themes.
- Keep one filled element per region: `brand` for the primary action, `accent` for the
  secondary, `border` for ghost outlines.

**Don't**

- Don't write raw hexes outside `global.css` and `config/theme.ts`.
- Don't add a new hue for success, warning, danger, or AI.
- Don't use `dark:` variants; the tokens already resolve per theme.
- Don't stack two fills with less than 3:1 between them.

---

## 5. Component inventory

Every component below renders from the same code in light and dark.

### Primitives — `src/components/ui/`

| component | notes |
| --- | --- |
| `Button` | primary (`bg-brand` + `text-on-brand`), secondary, danger, ghost; `sm`/`md`/`lg` sizes |
| `Card` | `bg-surface`, `border-border` |
| `Input` | `bg-surface`, focus ring via `border-focus`, muted placeholder |
| `Chip` | selected `bg-brand` + `text-on-brand`; unselected `bg-surface-alt` |
| `Icon` | monochrome Ionicons with semantic tone names |
| `Toggle` | `bg-brand` when on, `bg-border` when off |
| `Row` | `neutral`, `primary`, `success`, `danger` icon tiles |
| `Sheet` | bottom sheet on `bg-surface`, scrim `bg-ink/70` |
| `ScreenHeader` | icon, eyebrow, title, subtitle, optional action |
| `SectionHeading` | section label plus optional action |
| `EmptyState`, `ErrorState`, `Skeleton`, `SkeletonCard`, `Fab`, `BackButton`, `Screen`, `FormError` | state and chrome primitives |

### Domain — `src/components/domain/`

| component | notes |
| --- | --- |
| `TaskRow` | category tone from `constants/tasks.ts`, `TaskCheckbox` |
| `TaskCheckbox` | `bg-brand` when checked, `border-border` otherwise |
| `TaskComposer`, `TaskFields` | shared create/edit form fields |
| `ScanCapture`, `VoiceCapture` | capture surfaces on `bg-surface` |

### Navigation and chrome

| component | notes |
| --- | --- |
| `AppTabBar` | Forest base, white active bubble, neutral muted labels |
| `AuthScaffold` | keyboard-aware auth shell |
| `ThemeToggle`, `ThemePicker` | drive the persisted `Uniwind` theme |

### Category rotation — `src/constants/tasks.ts`

| category | fill | ink |
| --- | --- | --- |
| Personal, Learning, Errands | `bg-surface-alt` | `text-heading` |
| Work, Finance | `bg-brand` | `text-on-brand` |
| Health | `bg-accent` | `text-on-accent` |
| anything else | `bg-surface` + `border-border` | `text-body` |

---

## 6. Verify

```powershell
# types + lint
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/eslint/bin/eslint.js src

# Regenerate Uniwind artifacts from the token layer
node ./node_modules/uniwind/dist/cli/index.mjs generate-artifacts --css ./global.css

# Full web bundle
node ./node_modules/expo/bin/cli export --platform web --output-dir .tmp-web-export --clear
```

`npx` is blocked by this machine's PowerShell execution policy — invoke tooling through
`node ./node_modules/<pkg>/bin/<cli>` as above.
