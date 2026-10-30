import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";

export default function AdminTabLayout() {
  const insets = useSafeAreaInsets();
  const bottomSpace = Math.max(insets.bottom, 12);
  const { currentUser } = useAuth();

  // Only a logged-in admin may see this section.
  if (currentUser?.role !== "Admin") {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2623D3",
        tabBarInactiveTintColor: "#8993A8",
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 3 },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EEF0F8",
          borderTopWidth: 1,
          height: 58 + bottomSpace,
          paddingTop: 8,
          paddingBottom: bottomSpace,
          elevation: 8,
        },
        tabBarItemStyle: { paddingVertical: 2 },
        animation: "none",
        tabBarButton: (props) => (
          <Pressable {...props} android_ripple={{ color: "transparent" }} />
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Octicons name={focused ? "home-fill" : "home"} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account-group" : "account-group-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="verifications"
        options={{
          title: "Verify",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "shield-check" : "shield-check-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
