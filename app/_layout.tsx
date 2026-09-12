import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text } from 'react-native';
import { Crown } from 'lucide-react-native';
import { initPurchases, checkIsPro } from '../src/services/purchases';
import { useImageStore } from '../src/store/useImageStore';
import { t } from '../src/i18n';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const { isPro, setIsPro } = useImageStore();

  useEffect(() => {
    initPurchases();
    checkIsPro().then((pro) => setIsPro(pro));
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#020617' },
          headerRight: () =>
            !isPro ? (
              <TouchableOpacity
                onPress={() => router.push('/paywall')}
                className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full flex-row items-center"
              >
                <Crown size={14} color="#F59E0B" />
                <Text className="text-amber-400 text-xs font-bold ml-1.5">{t('proBadge')}</Text>
              </TouchableOpacity>
            ) : null,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'PackPixel',
            headerTitleAlign: 'left',
          }}
        />
        <Stack.Screen
          name="configure"
          options={{
            title: t('configureTitle'),
            headerBackTitle: t('back'),
          }}
        />
        <Stack.Screen
          name="processing"
          options={{
            title: t('processingTitle'),
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            title: t('paywallTitle'),
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
