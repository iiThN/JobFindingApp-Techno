
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";
import adminStyles, { STATUS_COLORS } from "../../../components/adminStyles";
import { supabase } from "../../../lib/supabase";

const FILTERS = ["All", "Job Seeker", "Employer"];

const isEmployer = (user) =>
  String(user.role || "").toLowerCase() === "employer";

export default function ManageUsers() {
  const [accounts, setAccounts] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadUsers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, status")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAccounts(
        (data || []).filter(
          (user) => String(user.role).toLowerCase() !== "admin"
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers(false);
  };

  const users = accounts
    .filter((user) => {
      if (filter === "Employer") return isEmployer(user);
      if (filter === "Job Seeker") return !isEmployer(user);
      return true;
    })
    .filter((user) => {
      const text = `${user.name || ""} ${user.email || ""}`.toLowerCase();
      return text.includes(query.trim().toLowerCase());
    });

  const toggleSuspend = (user) => {
    const suspending = user.status !== "suspended";
    const nextStatus = suspending ? "suspended" : "active";

    Alert.alert(
      suspending ? "Suspend account?" : "Re-activate account?",
      suspending
        ? `${user.name} will be marked as suspended.`
        : `${user.name} will be marked as active.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: suspending ? "Suspend" : "Re-activate",
          style: suspending ? "destructive" : "default",
          onPress: async () => {
            setProcessingId(user.id);

            try {
              const { error } = await supabase.rpc("set_user_status", {
                p_user_id: user.id,
                p_status: nextStatus,
              });

              if (error) throw error;

              await loadUsers(false);

              Alert.alert(
                "Success",
                `Account ${suspending ? "suspended" : "re-activated"}.`
              );
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={adminStyles.container} edges={["top"]}>
      <TopNav />

      <ScrollView
        contentContainerStyle={adminStyles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          <Text style={adminStyles.title}>Manage Users</Text>
          <Text style={adminStyles.subtitle}>
            View, suspend or re-activate user accounts.
          </Text>
        </View>

        <TextInput
          style={adminStyles.search}
          placeholder="Search by name or email"
          placeholderTextColor="#9AA6C1"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />

        <View style={adminStyles.chips}>
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                adminStyles.chip,
                filter === item && adminStyles.chipActive,
              ]}
              onPress={() => setFilter(item)}
            >
              <Text
                style={[
                  adminStyles.chipText,
                  filter === item && adminStyles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator color="#2623D3" />}

        {!!errorMessage && (
          <View style={adminStyles.card}>
            <Text style={{ color: "#E13F58" }}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => loadUsers()}>
              <Text style={{ color: "#2623D3", marginTop: 10 }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMessage && users.length === 0 && (
          <Text style={adminStyles.empty}>No users found.</Text>
        )}

        {!loading &&
          !errorMessage &&
          users.map((user) => {
            const status =
              user.status === "suspended" ? "suspended" : "active";

            const colors = STATUS_COLORS[status] || {
              bg: "#E2E8F0",
              fg: "#334155",
            };

            return (
              <View key={user.id} style={adminStyles.card}>
                <View style={adminStyles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={adminStyles.name} numberOfLines={1}>
                      {user.name}
                    </Text>

                    <Text style={adminStyles.meta} numberOfLines={1}>
                      {user.email}
                    </Text>

                    <Text style={adminStyles.meta}>
                      {isEmployer(user) ? "Employer" : "Job Seeker"}
                    </Text>
                  </View>

                  <View
                    style={[
                      adminStyles.badge,
                      { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        adminStyles.badgeText,
                        { color: colors.fg },
                      ]}
                    >
                      {status === "active" ? "Active" : "Suspended"}
                    </Text>
                  </View>
                </View>

                <View style={adminStyles.actions}>
                  <TouchableOpacity
                    disabled={processingId !== null}
                    style={[
                      adminStyles.btn,
                      { borderColor: "#2623D3" },
                    ]}
                    onPress={() => toggleSuspend(user)}
                  >
                    <Text
                      style={[
                        adminStyles.btnText,
                        { color: "#2623D3" },
                      ]}
                    >
                      {processingId === user.id
                        ? "Processing..."
                        : status === "active"
                        ? "Suspend"
                        : "Re-activate"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}
