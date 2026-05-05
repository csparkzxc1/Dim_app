import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { formatHHMM, parseHHMM, type WakeWindow } from '@/services/settings';

const MINUTE_STEP = 5;

type TimeWindowPickerProps = {
  value: WakeWindow;
  onChange: (next: WakeWindow) => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
};

function Stepper({
  label,
  onIncrement,
  onDecrement,
}: {
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperButtons}>
        <Pressable style={styles.stepperButton} onPress={onDecrement}>
          <Text style={styles.stepperButtonText}>−</Text>
        </Pressable>
        <Pressable style={styles.stepperButton} onPress={onIncrement}>
          <Text style={styles.stepperButtonText}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TimeField({ label, value, onChange }: FieldProps) {
  const { hour, minute } = parseHHMM(value);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.timeDisplay}>{value}</Text>
      <View style={styles.steppers}>
        <Stepper
          label="시"
          onIncrement={() => onChange(formatHHMM(hour + 1, minute))}
          onDecrement={() => onChange(formatHHMM(hour - 1, minute))}
        />
        <Stepper
          label="분"
          onIncrement={() => onChange(formatHHMM(hour, minute + MINUTE_STEP))}
          onDecrement={() => onChange(formatHHMM(hour, minute - MINUTE_STEP))}
        />
      </View>
    </View>
  );
}

export function TimeWindowPicker({ value, onChange }: TimeWindowPickerProps) {
  return (
    <View style={styles.container}>
      <TimeField
        label="시작"
        value={value.start}
        onChange={(start) => onChange({ ...value, start })}
      />
      <View style={styles.divider} />
      <TimeField
        label="끝"
        value={value.end}
        onChange={(end) => onChange({ ...value, end })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#15110E',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.7,
  },
  timeDisplay: {
    ...typography.headline,
    color: colors.textWarmGray,
    letterSpacing: 2,
  },
  steppers: {
    flexDirection: 'row',
    gap: 12,
  },
  stepper: {
    flex: 1,
    gap: 6,
  },
  stepperLabel: {
    ...typography.caption,
    color: colors.textWarmGray,
    opacity: 0.6,
  },
  stepperButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1F1814',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    ...typography.body,
    color: colors.accentAmber,
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.textWarmGray,
    opacity: 0.1,
  },
});
