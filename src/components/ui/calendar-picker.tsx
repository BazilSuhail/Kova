import { useMemo, useState } from 'react';
import { PanResponder, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Sheet } from '@/components/ui/sheet';
import { spacing, useThemeColors } from '@/config/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// Due dates are mostly upcoming: last year through five years ahead.
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, index) => THIS_YEAR - 1 + index);

const THUMB = 26;

function startOf(initialDate: string | undefined): Date {
  const parsed = initialDate ? new Date(`${initialDate.slice(0, 10)}T00:00:00`) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function CalendarPicker({ visible, onClose, onSelect, initialDate }: Props) {
  const colors = useThemeColors();

  const [year, setYear] = useState(() => startOf(initialDate).getFullYear());
  const [month, setMonth] = useState(() => startOf(initialDate).getMonth());
  const [day, setDay] = useState(() => String(startOf(initialDate).getDate()));
  const [wasVisible, setWasVisible] = useState(visible);

  // Re-seed from the current value each time the picker opens (state adjusted during render).
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      const base = startOf(initialDate);
      setYear(Math.min(Math.max(base.getFullYear(), YEARS[0]), YEARS[YEARS.length - 1]));
      setMonth(base.getMonth());
      setDay(String(base.getDate()));
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(Math.max(parseInt(day, 10) || 1, 1), daysInMonth);
  const preview = new Date(year, month, clampedDay);
  const previewLabel = preview.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  function handleDone() {
    const isoMonth = `${month + 1}`.padStart(2, '0');
    const isoDay = `${clampedDay}`.padStart(2, '0');
    onSelect(`${year}-${isoMonth}-${isoDay}`);
    onClose();
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Pick a date"
      subtitle={previewLabel}
      icon="calendar-outline"
    >
      <Text className="text-xs font-medium text-muted">Year</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm }}
        className="mt-2"
      >
        {YEARS.map((option) => (
          <Chip
            key={option}
            label={String(option)}
            selected={option === year}
            onPress={() => setYear(option)}
          />
        ))}
      </ScrollView>

      <View className="mt-6 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-muted">Month</Text>
        <Text className="text-sm font-semibold text-heading">{MONTHS[month]}</Text>
      </View>

      <MonthSlider value={month} onChange={setMonth} />

      <View className="mt-1 flex-row justify-between px-0.5">
        {MONTH_LETTERS.map((letter, index) => (
          <Text
            key={`${letter}-${index}`}
            className={`text-[11px] font-semibold ${
              index === month ? 'text-brand-ink' : 'text-muted'
            }`}
          >
            {letter}
          </Text>
        ))}
      </View>

      <Text className="mt-6 text-xs font-medium text-muted">Day</Text>
      <View className="mt-2 flex-row items-center" style={{ gap: spacing.md }}>
        <View className="h-12 w-20 items-center justify-center rounded-md border border-border bg-surface">
          <TextInput
            value={day}
            onChangeText={(value) => setDay(value.replace(/[^0-9]/g, '').slice(0, 2))}
            onBlur={() => setDay(String(clampedDay))}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel="Day of the month"
            placeholder="DD"
            placeholderTextColor={colors.muted}
            className="w-full text-center text-lg font-bold text-heading"
          />
        </View>
        <Text className="flex-1 text-xs text-muted">
          {daysInMonth} days in {MONTHS[month]}.
        </Text>
      </View>

      <View className="mt-6 flex-row" style={{ gap: spacing.sm }}>
        <Button className="flex-1" label="Cancel" variant="secondary" size="md" onPress={onClose} />
        <Button className="flex-1" label="Set date" icon="checkmark" size="md" onPress={handleDone} />
      </View>
    </Sheet>
  );
}

type SliderProps = {
  value: number;
  onChange: (month: number) => void;
};

function MonthSlider({ value, onChange }: SliderProps) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const trackWidth = width;
          if (!trackWidth) return;
          const ratio = Math.min(1, Math.max(0, event.nativeEvent.locationX / trackWidth));
          const next = Math.round(ratio * (MONTHS.length - 1));
          if (next !== value) onChange(next);
        },
        onPanResponderMove: (event) => {
          const trackWidth = width;
          if (!trackWidth) return;
          const ratio = Math.min(1, Math.max(0, event.nativeEvent.locationX / trackWidth));
          const next = Math.round(ratio * (MONTHS.length - 1));
          if (next !== value) onChange(next);
        },
      }),
    [width, value, onChange],
  );

  const ratio = value / (MONTHS.length - 1);
  const thumbLeft = ratio * Math.max(width - THUMB, 0);

  return (
    <View
      {...responder.panHandlers}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 11, now: value }}
      className="mt-3 justify-center"
      style={{ height: 36 }}
    >
      <View className="absolute left-0 right-0 h-1.5 rounded-full bg-border" />
      <View
        className="absolute h-1.5 rounded-full bg-brand"
        style={{ left: 0, width: width ? thumbLeft + THUMB / 2 : 0 }}
      />
      <View
        className="absolute items-center justify-center rounded-full border-2 border-surface bg-brand"
        style={{
          width: THUMB,
          height: THUMB,
          left: thumbLeft,
          shadowColor: colors.ink,
          shadowOpacity: 0.15,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      />
    </View>
  );
}
