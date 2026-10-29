import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import adminStyles from "../../../components/adminStyles";
import { useAuth } from "../../../context/AuthContext";

const isEmployer = (account) => String(account.role || "").toLowerCase().includes("employer");

function Stat({ icon, value, label, tint }) {
  return (
    <View style={local.stat}>
      <View style={[local.statIcon, { backgroundColor: tint + "22" }]}>
        <Feather name={icon} size={18} color={tint} />
      </View>
      <Text style={local.statValue}>{value}</Text>
      <Text style={local.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const { currentUser, accounts } = useAuth();

  const members = accounts.filter((a) => a.role !== "Admin");
  const employers = members.filter(isEmployer);
  const seekers = members.filter((a) => !isEmployer(a));
  const pending = employers.filter((e) => e.verificationStatus === "Pending");

  // Each admin sees their own review activity.
  const mine = employers.filter((e) => e.reviewedBy === currentUser?.email);
  const myVerified = mine.filter((e) => e.verificationStatus === "Verified").length;
  const myRejected = mine.filter((e) => e.verificationStatus === "Rejected").length;

  const firstName = currentUser?.name?.split(" ")[0] || "Admin";

  return (
    <SafeAreaView style={adminStyles.container} edges={["top"]}>
      <TopNav />
      <ScrollView contentContainerStyle={adminStyles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={adminStyles.title}>Welcome, {firstName}</Text>
          <Text style={adminStyles.subtitle}>
            Administrator dashboard · {currentUser?.email}
          </Text>
        </View>

        <View style={local.grid}>
          <Stat icon="users" value={members.length} label="Total users" tint="#2623D3" />
          <Stat icon="briefcase" value={employers.length} label="Employers" tint="#0E9F6E" />
          <Stat icon="user" value={seekers.length} label="Job seekers" tint="#7C3AED" />
          <Stat icon="clock" value={pending.length} label="Pending verification" tint="#B7791F" />
        </View>

        <Text style={adminStyles.sectionTitle}>Your activity</Text>
        <View style={adminStyles.card}>
          <View style={adminStyles.rowBetween}>
            <Text style={adminStyles.name}>Employers you verified</Text>
            <Text style={[adminStyles.name, { color: "#15803D" }]}>{myVerified}</Text>
          </View>
          <View style={adminStyles.rowBetween}>
            <Text style={adminStyles.name}>Employers you rejected</Text>
            <Text style={[adminStyles.name, { color: "#E13F58" }]}>{myRejected}</Text>
          </View>
        </View>

        <Text style={adminStyles.sectionTitle}>Quick actions</Text>
        <TouchableOpacity
          style={[adminStyles.card, adminStyles.rowBetween]}
          onPress={() => router.push("/(tabs)/(admin)/verifications")}
        >
          <View style={adminStyles.row}>
            <Feather name="shield" size={20} color="#2623D3" />
            <View>
              <Text style={adminStyles.name}>Verify employers</Text>
              <Text style={adminStyles.meta}>{pending.length} waiting for review</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#9AA6C1" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[adminStyles.card, adminStyles.rowBetween]}
          onPress={() => router.push("/(tabs)/(admin)/users")}
        >
          <View style={adminStyles.row}>
            <Feather name="user-check" size={20} color="#2623D3" />
            <View>
              <Text style={adminStyles.name}>Manage users</Text>
              <Text style={adminStyles.meta}>Suspend, re-activate or delete accounts</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#9AA6C1" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: {
    width: "47.8%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7EBFA",
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 24, fontWeight: "700", color: "#111C4B" },
  statLabel: { fontSize: 12, color: "#67759A", marginTop: 2 },
});
