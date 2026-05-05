import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useFonts, Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora';

import { loadSettings } from '@/services/settings';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(colors.backgroundBase).catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
  });
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((settings) => {
      if (cancelled) return;
      setSettingsReady(true);
      if (!settings.onboardingComplete) {
        router.replace('/onboarding');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && settingsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, settingsReady]);

  if ((!fontsLoaded && !fontError) || !settingsReady) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundBase },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="about"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundBase,
  },
});
