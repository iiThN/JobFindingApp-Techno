
import { Stack, router } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "react-native-gesture-handler";

import { ApplicationsProvider } from "../context/ApplicationsContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  // Custom back button for employer screens
  const renderCustomBackBtn = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.customBackBtn}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={20} color="#0F172A" />
    </TouchableOpacity>
  );

  return (
    <AuthProvider>
      <ApplicationsProvider>
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
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="details/[id]"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="apply/[id]"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="employer/applicant-detail/[id]"
            options={{
              headerShown: true,
              headerTitle: "",
              headerStyle: { backgroundColor: "#F8FAFC" },
              headerShadowVisible: true,
              headerTransparent: false,
              headerLeft: renderCustomBackBtn,
            }}
          />

          <Stack.Screen
            name="employer/applicants/[id]"
            options={{
              headerShown: true,
              headerTitle: "",
              headerStyle: { backgroundColor: "#F8FAFC" },
              headerShadowVisible: true,
              headerTransparent: false,
              headerLeft: renderCustomBackBtn,
            }}
          />

          <Stack.Screen
            name="employer/applicants-detail/[id]"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="employer/jobList/[id]"
            options={{
              headerShown: true,
              headerTitle: "",
              headerStyle: { backgroundColor: "#F8FAFC" },
              headerShadowVisible: true,
              headerTransparent: false,
              headerLeft: renderCustomBackBtn,
            }}
          />
        </Stack>
      </ApplicationsProvider>
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
