import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ApplicationCard from "../../../components/ApplicationCard";
import { TopNav } from "../../../components/Navigations";
import { useApplications } from "../../../context/ApplicationsContext";
import jobs from "../../../data/jobs";

const FILTERS = ["All", "Pending", "Rejected"];

export default function JobApps() {
  const router = useRouter();
  const { applications } = useApplications();
  const [filter, setFilter] = useState("All");

  // ikonekta ang application sa job info gamit ang jobId.
  const items = applications
    .map((application) => ({
      application,
      job: jobs.find((j) => j.id === application.jobId),
    }))
    .filter((item) => item.job);

  const visible =
    filter === "All" ? items : items.filter((i) => i.application.status === filter);

  const count = (status) => items.filter((i) => i.application.status === status).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <TopNav />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>My Applications</Text>
        <Text style={styles.subtitle}>Track every job you have applied for.</Text>

        <View style={styles.stats}>
          <View style={[styles.stat, styles.statMain]}>
            <Text style={[styles.statNumber, { color: "#FFFFFF" }]}>{items.length}</Text>
            <Text style={[styles.statLabel, { color: "#DBE1FF" }]}>Applied</Text>
          </View>

          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: "#7A4E00" }]}>{count("Pending")}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: "#B42318" }]}>{count("Rejected")}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {FILTERS.map((name) => {
            const active = filter === name;
            return (
              <TouchableOpacity
                key={name}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(name)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {items.length === 0 ? "No applications yet" : `No ${filter} applications`}
            </Text>
            <Text style={styles.emptyBody}>
              {items.length === 0
                ? "Jobs you apply to will show up here."
                : "Try another filter."}
            </Text>
            {items.length === 0 && (
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.navigate("/")}>
                <Text style={styles.emptyButtonText}>Browse jobs</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          visible.map(({ application, job }) => (
            <ApplicationCard
              key={application.jobId}
              job={job}
              application={application}
              onPress={() =>
                router.push({ pathname: "/details/[id]", params: { id: job.id } })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FF" },
  content: { paddingHorizontal: 19, paddingTop: 20, paddingBottom: 40 },
  heading: { fontSize: 25, fontWeight: "800", color: "#111C4B" },
  subtitle: { fontSize: 13, color: "#5B6788", marginTop: 6 },
  stats: { flexDirection: "row", gap: 10, marginTop: 20 },
  stat: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 17, padding: 14,
    borderWidth: 1, borderColor: "#EDF0F7",
  },
  statMain: { backgroundColor: "#2623D3", borderColor: "#2623D3" },
  statNumber: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#5B6788", marginTop: 4 },
  chipRow: { marginTop: 20, marginBottom: 16, flexGrow: 0 },
  chip: {
    height: 40, paddingHorizontal: 16, borderRadius: 20, marginRight: 8,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E1E5F2",
    alignItems: "center", justifyContent: "center",
  },
  chipActive: { backgroundColor: "#2623D3", borderColor: "#2623D3" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#111C4B" },
  chipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 50, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: "#111C4B" },
  emptyBody: { fontSize: 13, color: "#5B6788" },
  emptyButton: { marginTop: 10, backgroundColor: "#2623D3", borderRadius: 15, paddingVertical: 14, paddingHorizontal: 26 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});