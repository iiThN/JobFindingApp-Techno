import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import "react-native-gesture-handler";

import { ApplicationsProvider } from "../context/ApplicationsContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { NotificationsProvider } from "../context/NotificationsContext";

function AuthGuard() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const isProtectedRoute =
      segments[0] === "(tabs)" ||
      segments[0] === "details" ||
      segments[0] === "apply" ||
      segments[0] === "employer" ||
      segments[0] === "getVerified" ||
      segments[0] === "notifications";

    if (!currentUser && isProtectedRoute) {
      router.replace("/login");
    }
  }, [currentUser, loading, segments, router]);

  return null;
}

export default function RootLayout() {
  const renderCustomBackBtn = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.customBackBtn}
      activeOpacity={0.7}
    >
      <Ionicons
        name="arrow-back"
        size={20}
        color="#0F172A"
      />
    </TouchableOpacity>
  );

  return (
    <AuthProvider>
      <NotificationsProvider>
        <ApplicationsProvider>
          <AuthGuard />

          <Stack
            screenOptions={{
              statusBarStyle: "dark",
            }}
          >
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="selectRole"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="register"
              options={{
                headerShown: true,
                title: "",
                headerStyle: {
                  backgroundColor: "#f4f6f8c7",
                },
                headerShadowVisible: false,
                headerTransparent: true,
              }}
            />

            <Stack.Screen
              name="getVerified"
              options={{
                headerShown: true,
                title: "",
                headerStyle: {
                  backgroundColor: "rgba(244, 246, 248, 0.8)",
                },
                headerShadowVisible: false,
                headerTransparent: true,
              }}
            />

            <Stack.Screen
              name="notifications"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="jobseekerModal/details/[id]"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="jobseekerModal/apply/[id]"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="jobseekerModal/allJobList"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="jobseekerModal/search/searchModal"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />

            <Stack.Screen
              name="jobseekerModal/search/searchedDisplay"
              options={{
                headerShown: false,
              }}
            />    

            <Stack.Screen
              name="employerModal/applicant-detail/[id]"
              options={{
                headerShown: true,
                headerTitle: "",
                headerStyle: {
                  backgroundColor: "#F8FAFC",
                },
                headerShadowVisible: true,
                headerTransparent: false,
                headerLeft: renderCustomBackBtn,
              }}
            />

            <Stack.Screen
              name="employerModal/applicants/[id]"
              options={{
                headerShown: true,
                headerTitle: "",
                headerStyle: {
                  backgroundColor: "#F8FAFC",
                },
                headerShadowVisible: true,
                headerTransparent: false,
                headerLeft: renderCustomBackBtn,
              }}
            />

            <Stack.Screen
              name="employerModal/applicants-detail/[id]"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="employerModal/jobList/[id]"
              options={{
                headerShown: true,
                headerTitle: "",
                headerStyle: {
                  backgroundColor: "#F8FAFC",
                },
                headerShadowVisible: true,
                headerTransparent: false,
                headerLeft: renderCustomBackBtn,
              }}
            />
            
          </Stack>
        </ApplicationsProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  customBackBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
});