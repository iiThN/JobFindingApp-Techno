
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopNav } from "../../../components/Navigations";
import { supabase } from "../../../lib/supabase";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyName, setCompanyName] = useState("My Company");

  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalApplicants: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const [recentApplicants, setRecentApplicants] = useState([]);

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      // Kuhaon ang company name.
      const { data: company, error: companyError } =
        await supabase
          .from("employer_verifications")
          .select("company_name")
          .eq("employer_id", user.id)
          .eq("status", "Verified")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (companyError) throw companyError;

      setCompanyName(company?.company_name || "My Company");

      // Kuhaon ang employer jobs, apil ang archived.
      const { data: jobsData, error: jobsError } =
        await supabase
          .from("jobs")
          .select("id, title, status, is_archived")
          .eq("employer_id", user.id);

      if (jobsError) throw jobsError;

      const allJobs = jobsData || [];
      const activeJobs = allJobs.filter(
        (job) => !job.is_archived
      );

      const jobIds = allJobs.map((job) => job.id);

      let applications = [];

      if (jobIds.length > 0) {
        // Kuhaon ang applications sa tanan employer jobs.
        const { data, error } = await supabase
          .from("applications")
          .select(`
            id,
            job_id,
            full_name,
            status,
            created_at
          `)
          .in("job_id", jobIds)
          .order("created_at", { ascending: false });

        if (error) throw error;

        applications = data || [];
      }

      // Ihapon ang jobs ug applications.
      setStats({
        totalJobs: activeJobs.length,
        openJobs: activeJobs.filter(
          (job) => job.status?.toLowerCase() === "open"
        ).length,
        closedJobs: activeJobs.filter(
          (job) => job.status?.toLowerCase() === "closed"
        ).length,
        totalApplicants: applications.length,
        pending: applications.filter(
          (item) => item.status?.toLowerCase() === "pending"
        ).length,
        accepted: applications.filter(
          (item) => item.status?.toLowerCase() === "accepted"
        ).length,
        rejected: applications.filter(
          (item) => item.status?.toLowerCase() === "rejected"
        ).length,
      });

      // Ipakita ang five most recent applications.
      const recent = applications.slice(0, 5).map((item) => {
        const job = allJobs.find(
          (job) => job.id === item.job_id
        );

        return {
          ...item,
          applicantName: item.full_name || "Applicant",
          jobTitle: job?.title || "Job unavailable",
        };
      });

      setRecentApplicants(recent);
    } catch (error) {
      Alert.alert(
        "Dashboard Error",
        error.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh dashboard when returning to this screen.
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "#15803D";
      case "rejected":
        return "#B91C1C";
      default:
        return "#B45309";
    }
  };

  const getStatusBackground = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "#DCFCE7";
      case "rejected":
        return "#FEE2E2";
      default:
        return "#FEF3C7";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopNav />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            colors={["#2623D3"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Employer Dashboard</Text>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.subtitle}>
            Overview of your job postings and applications
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2623D3" />
            <Text style={styles.loadingText}>
              Loading dashboard...
            </Text>
          </View>
        ) : (
          <>
            {/* Main Statistics */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="briefcase-outline"
                title="Total Jobs"
                value={stats.totalJobs}
                color="#2623D3"
                background="#EEF2FF"
              />

              <StatCard
                icon="people-outline"
                title="Applications"
                value={stats.totalApplicants}
                color="#0284C7"
                background="#E0F2FE"
              />

              <StatCard
                icon="time-outline"
                title="Pending"
                value={stats.pending}
                color="#D97706"
                background="#FEF3C7"
              />

              <StatCard
                icon="checkmark-circle-outline"
                title="Accepted"
                value={stats.accepted}
                color="#15803D"
                background="#DCFCE7"
              />
            </View>

            {/* Job Overview */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Job Overview
              </Text>
            </View>

            <View style={styles.overviewCard}>
              <OverviewRow
                label="Open Job Postings"
                value={stats.openJobs}
                icon="checkmark-circle-outline"
                color="#15803D"
              />

              <View style={styles.divider} />

              <OverviewRow
                label="Closed Job Postings"
                value={stats.closedJobs}
                icon="lock-closed-outline"
                color="#B91C1C"
              />

              <View style={styles.divider} />

              <OverviewRow
                label="Rejected Applications"
                value={stats.rejected}
                icon="close-circle-outline"
                color="#B91C1C"
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Quick Actions
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  router.push("/(tabs)/(employer)/jobs")
                }
                activeOpacity={0.8}
              >
                <View style={styles.actionIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={23}
                    color="#2623D3"
                  />
                </View>
                <Text style={styles.actionTitle}>
                  Manage Jobs
                </Text>
                <Text style={styles.actionSubtitle}>
                  View and manage postings
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#2623D3"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() =>
                  router.push("/(tabs)/(employer)/applicants")
                }
                activeOpacity={0.8}
              >
                <View style={styles.actionIcon}>
                  <Ionicons
                    name="people-outline"
                    size={23}
                    color="#2623D3"
                  />
                </View>
                <Text style={styles.actionTitle}>
                  Applicants
                </Text>
                <Text style={styles.actionSubtitle}>
                  Review job applications
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#2623D3"
                />
              </TouchableOpacity>
            </View>

            {/* Recent Applications */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Recent Applications
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/(employer)/applicants")
                }
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentContainer}>
              {recentApplicants.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={42}
                    color="#CBD5E1"
                  />
                  <Text style={styles.emptyTitle}>
                    No applications yet
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    Applications submitted to your jobs will
                    appear here.
                  </Text>
                </View>
              ) : (
                recentApplicants.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.applicantRow,
                      index !== recentApplicants.length - 1 &&
                        styles.applicantDivider,
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push(
                        `/employer/applicant-detail/${item.id}`
                      )
                    }
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.applicantName
                          .split(" ")
                          .filter(Boolean)
                          .map((name) => name[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.applicantInfo}>
                      <Text
                        style={styles.applicantName}
                        numberOfLines={1}
                      >
                        {item.applicantName}
                      </Text>

                      <Text
                        style={styles.jobTitle}
                        numberOfLines={1}
                      >
                        {item.jobTitle}
                      </Text>

                      <Text style={styles.dateText}>
                        {new Date(
                          item.created_at
                        ).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusBackground(item.status),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: getStatusColor(item.status),
                          },
                        ]}
                      >
                        {item.status || "Pending"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable statistics card
function StatCard({
  icon,
  title,
  value,
  color,
  background,
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );
}

// Reusable overview row
function OverviewRow({ label, value, icon, color }) {
  return (
    <View style={styles.overviewRow}>
      <View style={styles.overviewLeft}>
        <Ionicons name={icon} size={19} color={color} />
        <Text style={styles.overviewLabel}>{label}</Text>
      </View>

      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111C4B",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2623D3",
    marginTop: 5,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: {
    fontSize: 27,
    fontWeight: "800",
    color: "#111C4B",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111C4B",
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2623D3",
  },
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  overviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111C4B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "flex-start",
    gap: 8,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111C4B",
  },
  actionSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    minHeight: 32,
  },
  recentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 14,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  applicantDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2623D3",
  },
  applicantInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 6,
  },
  applicantName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111C4B",
  },
  jobTitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  dateText: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 15,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 18,
  },
});
