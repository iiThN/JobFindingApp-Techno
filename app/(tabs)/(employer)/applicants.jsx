import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { TopNav } from "../../../components/Navigations";
// Import both initialApplicants and initialJobList to look up job titles
import { initialApplicants, initialJobList } from "../../../data/employer_data/employer_data";

export default function EmployerApplicantsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [applicants] = useState(initialApplicants);

  // Helper function to find the job title based on jobId
  const getJobTitle = (jobId) => {
    const matchedJob = initialJobList.find((job) => job.id === jobId);
    return matchedJob ? matchedJob.title : "General Application";
  };

  // Filter applicants based on search query, ID, or job title match
  const filteredApplicants = applicants.filter((item) => {
    const jobTitle = getJobTitle(item.jobId).toLowerCase();
    const matchesSearch =
      item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.applicantID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobTitle.includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && item.status === selectedFilter;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "accepted":
        return styles.acceptedBadge;
      case "rejected":
        return styles.rejectedBadge;
      default:
        return styles.pendingBadge;
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
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

      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Applicants</Text>
          <Text style={styles.headerSubtitle}>
            Manage candidates and incoming submissions
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredApplicants.length}</Text>
        </View>
      </View>

      {/* Search & Filter Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={20} color="#8993A8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidate, ID, or job title..."
            placeholderTextColor="#8993A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#8993A8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChipRow}>
          {["all", "pending", "accepted", "rejected"].map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.activeFilterChip]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.activeFilterChipText,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Applicants List */}
      <FlatList
        data={filteredApplicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Applicants Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search query or status filter.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const appliedJobTitle = getJobTitle(item.jobId);

          return (
            <TouchableOpacity
              style={styles.candidateCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push(`/employer/applicant-detail/${item.id}`)
              }
            >
              {/* Card Header: Avatar, Info, Status */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarWrapper}>
                  <Text style={styles.avatarInitial}>
                    {item.applicantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Text>
                </View>

                <View style={styles.candidateMeta}>
                  <Text style={styles.candidateName}>{item.applicantName}</Text>
                  
                  {/* Applied Job Pill Tag */}
                  <View style={styles.appliedJobTag}>
                    <BriefcaseIcon />
                    <Text style={styles.appliedJobText} numberOfLines={1}>
                      {appliedJobTitle}
                    </Text>
                  </View>

                  <Text style={styles.candidateSubDetail}>
                    ID: {item.applicantID} • Applied {item.date_applied}
                  </Text>
                </View>

                <View style={[styles.badge, getStatusBadgeStyle(item.status)]}>
                  <Text style={[styles.badgeText, getStatusTextStyle(item.status)]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Message Body Preview */}
              <View style={styles.messageBubble}>
                <Text numberOfLines={2} style={styles.messageContent}>
                  "{item.application_message}"
                </Text>
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.attachmentPill}>
                  <Feather name="paperclip" size={13} color="#2623D3" />
                  <Text style={styles.attachmentText} numberOfLines={1}>
                    {item.attached_files}
                  </Text>
                </View>

                <View style={styles.actionPrompt}>
                  <Text style={styles.actionText}>Review</Text>
                  <Ionicons name="arrow-forward" size={14} color="#2623D3" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

// Small icon helper for the job tag
const BriefcaseIcon = () => (
  <Ionicons name="briefcase-outline" size={12} color="#2623D3" style={{ marginRight: 4 }} />
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