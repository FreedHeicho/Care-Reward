import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="opportunity/[id]"
        options={{ title: "Opportunity", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="claim/[id]"
        options={{ title: "Claim Details", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="redeem"
        options={{ title: "Redeem Points", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="log-upcoming-care"
        options={{ title: "Log Upcoming Care", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="emr-access"
        options={{ title: "EMR Access", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="how-to-earn"
        options={{ title: "How to Earn Points", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="member-card"
        options={{ title: "Member ID Card", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="doctor-note"
        options={{ title: "Doctor Note", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Notification Preferences", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-assessment"
        options={{ title: "Health Assessment", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="find-provider"
        options={{ title: "Find a Provider", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="provider/[id]"
        options={{ title: "Provider Details", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Feather: require("../assets/fonts/Feather.ttf"),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
