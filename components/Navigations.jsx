import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text
} from "react-native";

import { NotificationBell } from "./NotificationBell";

export function TopNav() {
  const navigation = useNavigation("/(tabs)");
  const router = useRouter();

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
          onPress={() =>
            router.push("/jobseekerModal/search/searchModal")
          }
        >
          <Ionicons
            name="search"
            size={24}
            color="#111C4B"
          />
        </TouchableOpacity>

        <NotificationBell />
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
    paddingTop: 6,
    paddingBottom: 8,
  },

  topNavContainerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  topNavItem: {
    justifyContent: "center",
    alignItems: "center",
  },
});