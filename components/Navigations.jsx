import { Feather, FontAwesome, Ionicons, Octicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { NotificationBell } from "./NotificationBell";

export function TopNav() {
  const navigation = useNavigation("/(tabs)");

  return (
    <View style={styles.topNavContainer}>
      <TouchableOpacity
        style={styles.topNavItem}
        activeOpacity={0.5}
        accessibilityLabel="Open menu"
        onPress={() => navigation.openDrawer()}
      >
        <Feather
          name="menu"
          size={28}
          color="#111C4B"
        />
      </TouchableOpacity>

      <View style={styles.topNavContainerRight}>
        <TouchableOpacity
          style={styles.topNavItem}
          activeOpacity={0.5}
          accessibilityLabel="Search"
          onPress={() => Alert.alert("Search", "Coming soon.")}
        >
          <Ionicons name="search" size={24} color="#111C4B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topNavItem}
          activeOpacity={0.5}
          accessibilityLabel="Notifications"
          onPress={() => Alert.alert("Notifications", "Coming soon.")}
        >
          <Ionicons name="notifications" size={24} color="#111C4B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topNavContainer: {
    width: "100%",
    backgroundColor: "#F6F8FF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  topNavContainerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },

  topNavItem: {
    justifyContent: "center",
    alignItems: "center",
  },
});