import { Feather, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import styles from "./drawerStyles";

const menuItems = [
  { label: "Help & Support", icon: "help-circle" },
  { label: "About Us", icon: "info" },
  { label: "Privacy Policy", icon: "shield" },
  { label: "Terms of Service", icon: "file-text" },
];

export default function CustomDrawer(props) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const isEmployer = String(currentUser?.role || "").toLowerCase().includes("employer");
  const name = (isEmployer && currentUser?.company) || currentUser?.name || "Your Account";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/images/inJob-horizontal-dark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={() => props.navigation.closeDrawer()} accessibilityLabel="Close menu">
            <Feather name="x" size={23} color="#111C4B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>Find your next opportunity</Text>

        <View style={styles.accountRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.role}>{isEmployer ? "Employer" : "Job Seeker"}</Text>
            {!!currentUser?.email && <Text style={styles.email} numberOfLines={1}>{currentUser.email}</Text>}
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.section}>GENERAL</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => Alert.alert(item.label, "Coming soon.")}
          >
            <Feather name={item.icon} size={21} color="#59688B" />
            <Text style={styles.menuText}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color="#9AA6C1" />
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Feather name="log-out" size={21} color="#E13F58" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <Octicons name="briefcase" size={24} color="#2623D3" />
        <Text style={styles.footerText}>More opportunities. A brighter future.</Text>
      </View>
    </SafeAreaView>
  );
}
