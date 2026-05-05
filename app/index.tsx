import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

import { AmberGlow } from '@/components/AmberGlow';
import { LongPressGate } from '@/components/LongPressGate';
import { colors } from '@/theme/colors';

export default function SleepMode() {
  useKeepAwake();
  const [glowActive, setGlowActive] = useState(true);

  const handleUnlock = () => {
    setGlowActive(false);
  };

  return (
    <View style={styles.container}>
      <AmberGlow active={glowActive} />
      <LongPressGate onUnlock={handleUnlock} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
});
