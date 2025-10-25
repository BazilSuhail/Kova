# Kova design system

YouTube-style app shell: flat, calm, content-first. Brand colors (forest `#123F36`, pine `#2A6B5C`) are used for **foreground only** (text, icons, active states, chart strokes, buttons). Backgrounds stay soft neutrals.

## Palette

| Token | Light | Dark (soft, never pure black) |
|---|---|---|
| background | `#F7F8F6` | `#121816` |
| surface | `#FFFFFF` | `#1A2220` |
| surface-alt | `#EEF2EF` | `#222C29` |
| border | `#E1E6E2` | `#2E3A36` |
| heading | `#123F36` | `#E8F0EC` |
| body | `#2E4A43` | `#C3D1CB` |
| muted | `#6B7C76` | `#8A9C95` |
| brand (buttons, active) | `#123F36` | `#4F9A85` |
| accent | `#2A6B5C` | `#7FB5A3` |
| on-brand | `#FFFFFF` | `#0F1513` |
| brand-soft (tinted chip/selection bg) | `#DDEBE5` | `#1F3A33` |
| error | `#C2410C`-ish soft red `#C0392B` | `#E58A80` |

Chart series (soft, distinct): `#2A6B5C`, `#7FB5A3`, `#E3B178` (apricot), `#9DB0D8` (periwinkle), `#D79A9A` (rose).

## Shape and spacing
- Radii: `sm 4`, `md 8`, `lg 10`. Never larger on cards, sheets (top corners 12 max), inputs, or buttons. `full` only for avatars, dots, and filter chips.
- Spacing scale 4 / 8 / 12 / 16 / 20 / 24 / 32. Screen gutter 16. Section gap 24. Breathe; no cramped rows.
- Separate cards with borders (hairline `border`), not heavy shadows. One soft shadow only on floating elements (sheet, modal, FAB).

## YouTube patterns to follow
- **Top app bar**: brand mark + "Kova" left; icon buttons right (search/add, notifications with dot badge, avatar).
- **Filter chip row** under the app bar: horizontal scroll, pill chips, selected = brand fill + on-brand text, unselected = surface-alt.
- **Bottom tab bar**: icon above small label (11px), filled icon when active, outline when inactive, hairline top border, no floating pill.
- **Bottom sheets**: drag handle, title row, list rows of icon + label (YouTube "more" sheet), scrollable content, drag down to dismiss.
- Lots of icons. Every row/action has a leading icon. Labels are short and self-explaining.

## Motion
- Floating shapes: slow drifting soft blobs (opacity 0.06–0.12, brand/accent tints) behind dashboard header and auth screens. Respect reduced motion.
- Press feedback: scale 0.97 + haptic on primary actions. Entering lists: short fade/slide (reanimated `FadeInDown`).

## Status bar
Dark icons in light mode, light icons in dark mode. Android nav bar background follows `background`.

## Tokens in code
- Tailwind classes (uniwind): `bg-background`, `bg-surface`, `bg-surface-alt`, `border-border`, `text-heading`, `text-body`, `text-muted`, `bg-brand` / `text-on-brand`, `text-brand-ink` (brand as text, readable in dark), `bg-brand-soft`, `bg-success|warning|danger` (soft fills) with `text-on-success|on-warning|on-danger`, `text-danger-ink`, `bg-error-soft`, `bg-chart-1..5`.
- JS: `import { useThemeColors, spacing, radii, layout, chartColors } from '@/config/theme'`. `spacing` = xs 4, sm 8, md 12, lg 16, xl 20, xxl 24, xxxl 32. `layout.gutter` 16, `layout.sectionGap` 24. `radii` = sm 4, md 8, lg 10, xl 12 (sheet/dialog only), full.
- Tailwind `rounded-xl` / `rounded-2xl` are clamped to 10 and `rounded-3xl` to 12 in `global.css`, so old classes stay flat. Prefer `rounded-md` (controls) and `rounded-lg` (cards) in new code.
- Charts: `chartColors[0..4]` = pine, mint, apricot, periwinkle, rose. Use in order, e.g. gifted-charts `color={chartColors[0]}`; axis/label text uses `colors.muted`, grid lines `colors.border`.

## Components
All live in `src/components/ui/` (import as `@/components/ui/<file>`), except the tab bar.

| Component | Import | Usage |
|---|---|---|
| `AppBar`, `IconButton` | `@/components/ui/app-bar` | `<AppBar actions={[{ icon: 'search', accessibilityLabel: 'Search', onPress }, { icon: 'notifications-outline', accessibilityLabel: 'Notifications', badge: true, onPress }]} />` |
| `StatTile` | `@/components/ui/stat-tile` | `<StatTile icon="checkmark-done" value={12} label="Done this week" delta="+3" trend="up" />` (put 2 in a `flex-row` with `gap: spacing.md`) |
| `Sheet`, `SheetAction` | `@/components/ui/sheet` | `<Sheet visible={open} onClose={close} title="Task" actions={[{ icon: 'create-outline', label: 'Edit', onPress: edit }, { icon: 'trash-outline', label: 'Delete', destructive: true, onPress: remove }]} />` |
| `useDialog`, `Dialog`, `DialogProvider` | `@/components/ui/dialog` | `const { confirm } = useDialog(); if (await confirm({ title: 'Delete task', message: 'This cannot be undone.', icon: 'trash-outline', confirmLabel: 'Delete', destructive: true })) remove();` |
| `FloatingShapes` | `@/components/ui/floating-shapes` | `<View className="relative overflow-hidden"><FloatingShapes />{header}</View>` |
| `PressableScale` | `@/components/ui/pressable-scale` | `<PressableScale haptic onPress={go} className="rounded-lg bg-surface p-4">…</PressableScale>` |
| `Button` | `@/components/ui/button` | `<Button label="Save" icon="checkmark" onPress={save} />` (variants primary, secondary, danger, ghost; sizes sm, md, lg) |
| `Card` | `@/components/ui/card` | `<Card onPress={open}>…</Card>` |
| `Chip` | `@/components/ui/chip` | `<Chip label="Today" icon="today-outline" selected={f === 'today'} onPress={() => setF('today')} />` |
| `ChipRow` | `@/components/ui/chip-row` | `<ChipRow label="Priority" options={opts} value={v} onChange={setV} feedback />` |
| `Input` | `@/components/ui/input` | `<Input label="Title" icon="text-outline" value={t} onChangeText={setT} error={err} />` |
| `Row` | `@/components/ui/row` | `<Row icon="notifications-outline" title="Reminders" subtitle="3 active" onPress={go} />` (wrap rows in a `Card padded={false}`) |
| `Screen` | `@/components/ui/screen` | `<Screen>…</Screen>` (16 gutter, scrolls). With an AppBar: `<Screen scroll={false}><AppBar /><ScrollView>…</ScrollView></Screen>` |
| `ScreenHeader` | `@/components/ui/screen-header` | `<ScreenHeader back title="Reminders" subtitle="Nudges at the right time" />` |
| `SectionHeading` | `@/components/ui/section-heading` | `<SectionHeading action={<Button variant="ghost" size="sm" label="See all" onPress={all} />}><Text className="text-base font-semibold text-heading">Today</Text></SectionHeading>` |
| `EmptyState` | `@/components/ui/empty-state` | `<EmptyState icon="leaf-outline" title="No tasks" description="Add one to get going." actionLabel="Add task" onAction={add} />` |
| `ErrorState` | `@/components/ui/error-state` | `<ErrorState message={error.message} onRetry={refetch} />` |
| `Fab` | `@/components/ui/fab` | `<Fab icon="add" accessibilityLabel="New task" onPress={add} />` |
| `Skeleton`, `SkeletonCard` | `@/components/ui/skeleton` | `<SkeletonCard lines={3} />` |
| `Toggle` | `@/components/ui/toggle` | `<Toggle label="Daily digest" hint="8:00 every morning" value={on} onChange={setOn} />` |
| `BackButton` | `@/components/ui/back-button` | `<BackButton fallback="/tasks" />` |
| `AppTabBar` | `@/components/navigation/tab-bar` | Already mounted in `src/app/(tabs)/_layout.tsx`. |

Notes:
- `Sheet` already scrolls and handles keyboard + bottom safe area. Do not nest a vertical `ScrollView` in it (horizontal ones are fine). Drag down from the handle, or from the content when it is scrolled to the top, to dismiss. An action row calls `onClose()` and then its `onPress`.
- `useDialog().confirm` replaces `Alert.alert` confirmations. It resolves `false` on cancel, backdrop or Android back. `cancelLabel: null` gives a single-button notice. `DialogProvider` is mounted in `src/app/_layout.tsx`.
- Haptics: `PressableScale haptic` (used by primary/danger `Button` and `Fab`), `selectFeedback()` on tab change, toggle and `ChipRow feedback`. Helpers live in `@/lib/haptics`.
- Entering lists: `<Animated.View entering={FadeInDown.duration(220).delay(index * 40)}>` from `react-native-reanimated`.
