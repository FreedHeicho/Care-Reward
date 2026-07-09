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
import { HealthRecordsProvider } from "@/context/HealthRecordsContext";

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
        name="log-upcoming-care"
        options={{ title: "Log Upcoming Care", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="emr-access"
        options={{ title: "Health Records", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/add-method"
        options={{ title: "Add Your Health Care Provider", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/search-npi"
        options={{ title: "Search by Provider ID", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/search-institution"
        options={{ title: "Search Institution", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/confirm"
        options={{ title: "Confirm Connection", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/portal-login"
        options={{ title: "Patient Portal", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/immunizations"
        options={{ title: "Immunizations", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/visits"
        options={{ title: "Visits", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/visit-detail"
        options={{ title: "Visit Detail", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/lab-results"
        options={{ title: "Lab Results", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="health-records/lab-result-detail"
        options={{ title: "Lab Result", headerBackTitle: "Back" }}
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
      <Stack.Screen
        name="opportunity-variants/[id]"
        options={{ title: "Choose Your Path", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="schedule-opportunity"
        options={{ title: "Schedule Appointment", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="missed-opportunities"
        options={{ title: "Missed Opportunities", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="redeem/premium"
        options={{ title: "Premium Allocation", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="redeem/hsa"
        options={{ title: "HSA Contribution", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="redeem/giftcard"
        options={{ title: "Healthcare Giftcards", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="connect-devices/index"
        options={{ title: "Connect Health Devices", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="connect-devices/[type]"
        options={{ title: "Available Devices", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="connect-devices/pair"
        options={{ title: "Pair Device", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="redeem/confirm"
        options={{ title: "Confirm Redemption", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="redeem/final-confirm"
        options={{ title: "Final Confirmation", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="browser"
        options={{ headerShown: false, presentation: "modal" }}
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
          <HealthRecordsProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </HealthRecordsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
