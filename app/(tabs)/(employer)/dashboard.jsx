import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopNav />
      <View style={styles.content}>
        <Text style={styles.title}>Employer Dashboard</Text>
        <Text style={styles.subtitle}>Manage your job posts and applicants here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FF" },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#111C4B" },
  subtitle: { fontSize: 14, color: "#6876A6", marginTop: 10, lineHeight: 21 },
});
