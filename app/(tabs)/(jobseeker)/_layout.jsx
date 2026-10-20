
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const bottomSpace = Math.max(insets.bottom, 12);

  return (
    <Tabs
      
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2623D3",
        tabBarInactiveTintColor: "#8993A8",

        tabBarShowLabel: true,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 3,
        },

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EEF0F8",
          borderTopWidth: 1,
          height: 58 + bottomSpace,
          paddingTop: 8,
          paddingBottom: bottomSpace,
          elevation: 8,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        animation: "none",

        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
          />
        ),
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name={focused ? "home-fill" : "home"}
              size={23}
              color={color}
            />
          ),
        }}
      />

      {/* Applications */}
      <Tabs.Screen
        name="jobApps"
        options={{
          title: "Applications",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? "file-document"
                  : "file-document-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Saved */}
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Octicons
              name={focused ? "person-fill" : "person"}
              size={23}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
