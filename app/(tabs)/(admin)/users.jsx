import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import adminStyles, { STATUS_COLORS } from "../../../components/adminStyles";
import { useAuth } from "../../../context/AuthContext";

const FILTERS = ["All", "Job Seeker", "Employer"];
const isEmployer = (account) => String(account.role || "").toLowerCase().includes("employer");

export default function ManageUsers() {
  const { accounts, setAccountStatus, deleteAccount } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const users = accounts
    .filter((a) => a.role !== "Admin")
    .filter((a) => {
      if (filter === "Employer") return isEmployer(a);
      if (filter === "Job Seeker") return !isEmployer(a);
      return true;
    })
    .filter((a) => {
      const text = `${a.name} ${a.email} ${a.companyName || ""}`.toLowerCase();
      return text.includes(query.trim().toLowerCase());
    });

  const toggleSuspend = (user) => {
    const suspending = user.status !== "suspended";

    Alert.alert(
      suspending ? "Suspend account?" : "Re-activate account?",
      suspending
        ? `${user.name} will no longer be able to log in.`
        : `${user.name} will be able to log in again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: suspending ? "Suspend" : "Re-activate",
          style: suspending ? "destructive" : "default",
          onPress: () => {
            const result = setAccountStatus(user.email, suspending ? "suspended" : "active");
            if (!result.success) Alert.alert("Error", result.message);
          },
        },
      ]
    );
  };

  const confirmDelete = (user) => {
    Alert.alert("Delete account?", `${user.name} (${user.email}) will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const result = deleteAccount(user.email);
          if (!result.success) Alert.alert("Error", result.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={adminStyles.container} edges={["top"]}>
      <TopNav />
      <ScrollView
        contentContainerStyle={adminStyles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={adminStyles.title}>Manage Users</Text>
          <Text style={adminStyles.subtitle}>Suspend, re-activate or delete user accounts.</Text>
        </View>

        <TextInput
          style={adminStyles.search}
          placeholder="Search by name, email or company"
          placeholderTextColor="#9AA6C1"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />

        <View style={adminStyles.chips}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[adminStyles.chip, filter === item && adminStyles.chipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[adminStyles.chipText, filter === item && adminStyles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {users.length === 0 && <Text style={adminStyles.empty}>No users found.</Text>}

        {users.map((user) => {
          const status = user.status === "suspended" ? "suspended" : "active";
          const colors = STATUS_COLORS[status];

          return (
            <View key={user.email} style={adminStyles.card}>
              <View style={adminStyles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={adminStyles.name} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={adminStyles.meta} numberOfLines={1}>
                    {user.email}
                  </Text>
                  <Text style={adminStyles.meta}>
                    {isEmployer(user) ? `Employer · ${user.companyName || "—"}` : "Job Seeker"}
                  </Text>
                </View>
                <View style={[adminStyles.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[adminStyles.badgeText, { color: colors.fg }]}>
                    {status === "active" ? "Active" : "Suspended"}
                  </Text>
                </View>
              </View>

              <View style={adminStyles.actions}>
                <TouchableOpacity
                  style={[adminStyles.btn, { borderColor: "#2623D3" }]}
                  onPress={() => toggleSuspend(user)}
                >
                  <Text style={[adminStyles.btnText, { color: "#2623D3" }]}>
                    {status === "active" ? "Suspend" : "Re-activate"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[adminStyles.btn, { borderColor: "#E13F58" }]}
                  onPress={() => confirmDelete(user)}
                >
                  <Text style={[adminStyles.btnText, { color: "#E13F58" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
