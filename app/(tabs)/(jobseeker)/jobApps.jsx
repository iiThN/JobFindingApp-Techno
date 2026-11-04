import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ApplicationCard from "../../../components/ApplicationCard";
import { TopNav } from "../../../components/Navigations";
import styles from "../../../components/stylesIn";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

const FILTERS = ["All", "Pending", "Accepted", "Rejected"];

export default function JobApps() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadApplications = async () => {
        setLoading(true);
        setLoadError("");

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user?.id) {
            if (active) {
              setItems([]);
              setLoadError("Please log in again.");
            }
            return;
          }

          const { data, error } = await supabase
            .from("applications")
            .select(
              "id, job_id, applicant_id, status, reply_from_employer, created_at"
            )
            .eq("applicant_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          const jobIds = [
            ...new Set((data || []).map((item) => item.job_id)),
          ];

          let jobs = [];

          if (jobIds.length > 0) {
            const { data: jobData, error: jobError } =
              await supabase
                .from("jobLists")
                .select(`
                  id,
                  title,
                  location,
                  job_type,
                  salary,
                  profiles:employer_id (
                    name
                  )
                `)
                .in("id", jobIds);

            if (!jobError) {
              jobs = jobData || [];
            }
          }

          const mapped = (data || []).map((row) => {
            const relatedJob = jobs.find(
              (job) => job.id === row.job_id
            );

            return {
              application: {
                id: row.id,
                jobId: row.job_id,
                status: row.status,
                appliedAt: row.created_at,
                replyMessage: row.reply_from_employer || "",
              },
              job: {
                id: row.job_id,
                title: relatedJob?.title || "Job unavailable",
                location:
                  relatedJob?.location || "Unknown location",
                company:
                  relatedJob?.profiles?.name || "Employer",
                type: relatedJob?.job_type || "",
                salary: relatedJob?.salary || "",
                icon: "briefcase-outline",
                color: "#E9ECFF",
              },
            };
          });

          if (active) {
            setItems(mapped);
          }
        } catch (error) {
          if (active) {
            setLoadError(
              error.message || "Failed to load applications."
            );
            setItems([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      loadApplications();

      return () => {
        active = false;
      };
    }, [currentUser?.id])
  );

  const visible =
    filter === "All"
      ? items
      : items.filter(
          (item) => item.application.status === filter
        );

  const count = (status) =>
    items.filter(
      (item) => item.application.status === status
    ).length;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <TopNav />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.jobAppsHeading}>
          My Applications
        </Text>

        <Text style={styles.jobAppsSubtitle}>
          Track every job you have applied for.
        </Text>

        <View style={styles.jobAppsStatsRow}>
          <View style={[styles.jobAppsStatCard, styles.jobAppsStatMain]}>
            <Text
              style={[
                styles.jobAppsStatNumber,
                { color: "#FFFFFF" },
              ]}
            >
              {items.length}
            </Text>

            <Text
              style={[
                styles.jobAppsStatLabel,
                { color: "#DBE1FF" },
              ]}
            >
              Applied
            </Text>
          </View>

          <View style={styles.jobAppsStatCard}>
            <Text
              style={[
                styles.jobAppsStatNumber,
                { color: "#7A4E00" },
              ]}
            >
              {count("Pending")}
            </Text>

            <Text style={styles.jobAppsStatLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.jobAppsStatCard}>
            <Text
              style={[
                styles.jobAppsStatNumber,
                { color: "#B42318" },
              ]}
            >
              {count("Rejected")}
            </Text>

            <Text style={styles.jobAppsStatLabel}>
              Rejected
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.jobAppsChipRow}
        >
          {FILTERS.map((name) => {
            const selected = filter === name;

            return (
              <TouchableOpacity
                key={name}
                style={[
                  styles.jobAppsChip,
                  selected && styles.jobAppsChipActive,
                ]}
                onPress={() => setFilter(name)}
              >
                <Text
                  style={[
                    styles.jobAppsChipText,
                    selected && styles.jobAppsChipTextActive,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2623D3"
            style={{ marginTop: 40 }}
          />
        ) : loadError ? (
          <View style={styles.jobAppsEmptyContainer}>
            <Text style={styles.jobAppsEmptyTitle}>
              Unable to load applications
            </Text>

            <Text style={styles.jobAppsEmptyBody}>
              {loadError}
            </Text>
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.jobAppsEmptyContainer}>
            <Text style={styles.jobAppsEmptyTitle}>
              {items.length === 0
                ? "No applications yet"
                : `No ${filter} applications`}
            </Text>

            <Text style={styles.jobAppsEmptyBody}>
              {items.length === 0
                ? "Jobs you apply to will show up here."
                : "Try another filter."}
            </Text>

            {items.length === 0 && (
              <TouchableOpacity
                style={styles.jobAppsEmptyButton}
                onPress={() => router.navigate("/")}
              >
                <Text style={styles.jobAppsEmptyButtonText}>
                  Browse jobs
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {visible.map(({ application, job }) => (
              <ApplicationCard
                key={application.id}
                job={job}
                application={application}
                onPress={() =>
                  router.push({
                    pathname: "/jobseekerModal/details/[id]",
                    params: { id: job.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}