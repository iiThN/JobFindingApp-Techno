
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import JobCard from "../../../components/JobCard";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function SavedJobsScreen() {
  const { currentUser } = useAuth();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchSavedJobs = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const savedIds = currentUser?.savedJobs || [];

      console.log("[SAVED JOBS] Saved job IDs:", savedIds);

      if (savedIds.length === 0) {
        setSavedJobs([]);
        return;
      }

      const { data, error } = await supabase
        .from("jobLists")
        .select(`
          *,
          profiles:employer_id (
            name
          )
        `)
        .in("id", savedIds);

      if (error) {
        throw error;
      }

      console.log("[SAVED JOBS] Fetched jobs:", data);
      console.log("[SAVED JOBS] Expected IDs:", savedIds);
      console.log(
        "[SAVED JOBS] Retrieved IDs:",
        (data || []).map((job) => job.id)
      );

      const formattedJobs = (data || []).map((job) => ({
        ...job,
        company: job.profiles?.name || "Employer",
        company_name: job.profiles?.name || "Employer",
        type: job.job_type,
        icon: "briefcase-outline",
        color: "#E9ECFF",
      }));

      setSavedJobs(formattedJobs);

    } catch (error) {
      console.log("[SAVED JOBS] Fetch error:", error);

      setLoadError(error.message || "Unable to load saved jobs.");
      setSavedJobs([]);

    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedJobs();
    }, [currentUser?.savedJobs])
  );

  const renderSavedJob = ({ item }) => {
    const isClosed =
      item.status?.toLowerCase() === "closed";

    return (
      <View style={styles.jobContainer}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              isClosed
                ? styles.closedBadge
                : styles.openBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isClosed
                  ? styles.closedText
                  : styles.openText,
              ]}
            >
              {item.status || "Unknown"}
            </Text>
          </View>
        </View>

        <JobCard job={item} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Jobs</Text>
        <Text style={styles.subtitle}>
          Jobs you have bookmarked
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4F46E5"
          style={styles.loader}
        />
      ) : loadError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Unable to load saved jobs
          </Text>
          <Text style={styles.emptyText}>
            {loadError}
          </Text>
        </View>
      ) : savedJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No saved jobs yet
          </Text>
          <Text style={styles.emptyText}>
            Jobs you bookmark will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSavedJob}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#171717",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  jobContainer: {
    marginBottom: 14,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  openBadge: {
    backgroundColor: "#DCFCE7",
  },
  closedBadge: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  openText: {
    color: "#15803D",
  },
  closedText: {
    color: "#B91C1C",
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
});
