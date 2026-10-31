
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopNav } from "../../../components/Navigations";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function EmployerApplicantsScreen() {
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadApplicants = async () => {
        setLoading(true);
        setLoadError("");

        try {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError) throw authError;

          if (!user?.id) {
            throw new Error("Please log in again.");
          }

          // Kuhaon ang jobs sa logged-in employer.
          const { data: jobs, error: jobsError } =
            await supabase
              .from("jobs")
              .select("id, title")
              .eq("employer_id", user.id);

          if (jobsError) throw jobsError;

          const jobList = jobs || [];
          const jobIds = jobList.map((job) => job.id);

          if (jobIds.length === 0) {
            if (active) setApplicants([]);
            return;
          }

          // Kuhaon ang applications sa employer jobs.
          const { data, error } = await supabase
            .from("applications")
            .select(`
              id,
              job_id,
              applicant_id,
              full_name,
              email,
              note,
              attachment_paths,
              status,
              created_at
            `)
            .in("job_id", jobIds)
            .order("created_at", { ascending: false });

          console.log("Employer applications:", data);
          console.log("Employer applications error:", error);

          if (error) throw error;

          const mapped = (data || []).map((item) => {
            const job = jobList.find(
              (job) => job.id === item.job_id
            );

            return {
              id: item.id,
              jobId: item.job_id,
              applicantID: item.applicant_id,
              applicantName: item.full_name,
              email: item.email,
              application_message: item.note || "",
              attachmentPaths: item.attachment_paths || [],
              status: item.status,
              date_applied: new Date(
                item.created_at
              ).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              jobTitle: job?.title || "Job unavailable",
            };
          });

          if (active) setApplicants(mapped);
        } catch (error) {
          console.log("Load applicants error:", error);

          if (active) {
            setApplicants([]);
            setLoadError(
              error.message || "Failed to load applicants."
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      loadApplicants();

      return () => {
        active = false;
      };
    }, [currentUser?.id])
  );

  const filteredApplicants = applicants.filter((item) => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      item.applicantName.toLowerCase().includes(search) ||
      item.applicantID.toLowerCase().includes(search) ||
      item.jobTitle.toLowerCase().includes(search);

    if (selectedFilter === "all") return matchesSearch;

    return (
      matchesSearch &&
      item.status.toLowerCase() === selectedFilter
    );
  });

  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return styles.acceptedBadge;
      case "rejected":
        return styles.rejectedBadge;
      default:
        return styles.pendingBadge;
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return styles.acceptedText;
      case "rejected":
        return styles.rejectedText;
      default:
        return styles.pendingText;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Applicants</Text>
          <Text style={styles.headerSubtitle}>
            Manage candidates and incoming submissions
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {filteredApplicants.length}
          </Text>
        </View>
      </View>

      <View style={styles.controlsSection}>
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#8993A8"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search candidate, ID, or job title..."
            placeholderTextColor="#8993A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#8993A8"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterChipRow}>
          {["all", "pending", "accepted", "rejected"].map(
            (filter) => {
              const isActive = selectedFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    isActive && styles.activeFilterChip,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.activeFilterChipText,
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() +
                      filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </View>

      <FlatList
        data={filteredApplicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <>
                <ActivityIndicator
                  size="large"
                  color="#2623D3"
                />
                <Text style={styles.emptySubtitle}>
                  Loading applicants...
                </Text>
              </>
            ) : loadError ? (
              <>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#B91C1C"
                />
                <Text style={styles.emptyTitle}>
                  Unable to load applicants
                </Text>
                <Text style={styles.emptySubtitle}>
                  {loadError}
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="folder-open-outline"
                  size={56}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyTitle}>
                  No Applicants Found
                </Text>
                <Text style={styles.emptySubtitle}>
                  {applicants.length === 0
                    ? "Applications to your jobs will appear here."
                    : "Try adjusting your search query or status filter."}
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.candidateCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                `/employer/applicant-detail/${item.id}`
              )
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatarWrapper}>
                <Text style={styles.avatarInitial}>
                  {item.applicantName
                    .split(" ")
                    .filter(Boolean)
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.candidateMeta}>
                <Text style={styles.candidateName}>
                  {item.applicantName}
                </Text>

                <View style={styles.appliedJobTag}>
                  <BriefcaseIcon />
                  <Text
                    style={styles.appliedJobText}
                    numberOfLines={1}
                  >
                    {item.jobTitle}
                  </Text>
                </View>

                <Text style={styles.candidateSubDetail}>
                  ID: {item.applicantID.slice(0, 8)} • Applied{" "}
                  {item.date_applied}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  getStatusBadgeStyle(item.status),
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    getStatusTextStyle(item.status),
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.messageBubble}>
              <Text
                numberOfLines={2}
                style={styles.messageContent}
              >
                {item.application_message
                  ? `"${item.application_message}"`
                  : "No application message provided."}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.attachmentPill}>
                <Feather
                  name="paperclip"
                  size={13}
                  color="#2623D3"
                />
                <Text
                  style={styles.attachmentText}
                  numberOfLines={1}
                >
                  {item.attachmentPaths.length}{" "}
                  {item.attachmentPaths.length === 1
                    ? "attachment"
                    : "attachments"}
                </Text>
              </View>

              <View style={styles.actionPrompt}>
                <Text style={styles.actionText}>
                  Review
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="#2623D3"
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const BriefcaseIcon = () => (
  <Ionicons
    name="briefcase-outline"
    size={12}
    color="#2623D3"
    style={{ marginRight: 4 }}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: "rgba(38, 35, 211, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: "#2623D3",
    fontWeight: "700",
    fontSize: 13,
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0F172A",
  },
  filterChipRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeFilterChip: {
    backgroundColor: "#2623D3",
    borderColor: "#2623D3",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  activeFilterChipText: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  candidateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2623D3",
  },
  candidateMeta: {
    flex: 1,
    marginLeft: 12,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  appliedJobTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(38, 35, 211, 0.06)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  appliedJobText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2623D3",
  },
  candidateSubDetail: {
    fontSize: 11,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  acceptedBadge: {
    backgroundColor: "#DCFCE7",
  },
  rejectedBadge: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  pendingText: {
    color: "#B45309",
  },
  acceptedText: {
    color: "#15803D",
  },
  rejectedText: {
    color: "#B91C1C",
  },
  messageBubble: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  messageContent: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(38, 35, 211, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: "70%",
  },
  attachmentText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2623D3",
  },
  actionPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2623D3",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
});
