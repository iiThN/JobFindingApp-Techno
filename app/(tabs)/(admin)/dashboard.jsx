
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import adminStyles from "../../../components/adminStyles";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

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
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    employers: 0,
    seekers: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role");

      if (profilesError) throw profilesError;

      const { data: requests, error: requestsError } = await supabase
        .from("employer_verifications")
        .select("status, reviewed_by");

      if (requestsError) throw requestsError;

      const members = (profiles || []).filter(
        (user) => String(user.role).toLowerCase() !== "admin"
      );

      const employers = members.filter(
        (user) => String(user.role).toLowerCase() === "employer"
      );

      const seekers = members.filter(
        (user) => String(user.role).toLowerCase() === "job seeker"
      );

      const mine = (requests || []).filter(
        (request) => request.reviewed_by === currentUser?.id
      );

      setStats({
        users: members.length,
        employers: employers.length,
        seekers: seekers.length,
        pending: (requests || []).filter(
          (request) => request.status === "Pending"
        ).length,
        verified: mine.filter(
          (request) => request.status === "Verified"
        ).length,
        rejected: mine.filter(
          (request) => request.status === "Rejected"
        ).length,
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [currentUser?.id])
  );

  const firstName = currentUser?.name?.split(" ")[0] || "Admin";

  return (
    <SafeAreaView style={adminStyles.container} edges={["top"]}>
      <TopNav />
      <ScrollView
        contentContainerStyle={adminStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={adminStyles.title}>Welcome, {firstName}</Text>
          <Text style={adminStyles.subtitle}>
            Administrator dashboard · {currentUser?.email}
          </Text>
        </View>

        {loading && <ActivityIndicator color="#2623D3" />}

        {!!errorMessage && (
          <Text style={{ color: "#E13F58" }}>{errorMessage}</Text>
        )}

        <View style={local.grid}>
          <Stat icon="users" value={stats.users} label="Total users" tint="#2623D3" />
          <Stat icon="briefcase" value={stats.employers} label="Employers" tint="#0E9F6E" />
          <Stat icon="user" value={stats.seekers} label="Job seekers" tint="#7C3AED" />
          <Stat icon="clock" value={stats.pending} label="Pending verification" tint="#B7791F" />
        </View>

        <Text style={adminStyles.sectionTitle}>Your activity</Text>
        <View style={adminStyles.card}>
          <View style={adminStyles.rowBetween}>
            <Text style={adminStyles.name}>Employers you verified</Text>
            <Text style={[adminStyles.name, { color: "#15803D" }]}>
              {stats.verified}
            </Text>
          </View>
          <View style={adminStyles.rowBetween}>
            <Text style={adminStyles.name}>Employers you rejected</Text>
            <Text style={[adminStyles.name, { color: "#E13F58" }]}>
              {stats.rejected}
            </Text>
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
              <Text style={adminStyles.meta}>
                {stats.pending} waiting for review
              </Text>
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
              <Text style={adminStyles.meta}>
                View, suspend or re-activate accounts
              </Text>
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
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111C4B",
  },
  statLabel: {
    fontSize: 12,
    color: "#67759A",
    marginTop: 2,
  },
});
