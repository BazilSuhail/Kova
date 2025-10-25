import { Sheet } from '@/components/ui/sheet';
import { TASK_CATEGORY_SUGGESTIONS } from '@/constants/tasks';
import type { IconName } from '@/theme/icons';

const CATEGORY_ICONS: Record<string, IconName> = {
  Personal: 'person-outline',
  Work: 'briefcase-outline',
  Health: 'heart-outline',
  Learning: 'school-outline',
  Errands: 'cart-outline',
  Finance: 'wallet-outline',
};

type Props = {
  visible: boolean;
  value?: string;
  onClose: () => void;
  onSelect: (category: string) => void;
};

export function CategoryPicker({ visible, value, onClose, onSelect }: Props) {
  const current = (value ?? '').toLowerCase();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Category"
      subtitle="Pick where this task belongs."
      icon="pricetags-outline"
      actions={[
        ...TASK_CATEGORY_SUGGESTIONS.map((category) => ({
          icon:
            current === category.toLowerCase()
              ? ('checkmark-circle' as IconName)
              : (CATEGORY_ICONS[category] ?? 'pricetag-outline'),
          label: category,
          onPress: () => onSelect(category),
        })),
        {
          icon: 'close-circle-outline',
          label: 'No category',
          subtitle: current ? `Remove "${value}"` : undefined,
          onPress: () => onSelect(''),
        },
      ]}
    />
  );
}
