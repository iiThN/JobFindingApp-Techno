import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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

import JobCard from "../../../components/JobCard";
import { TopNav } from "../../../components/Navigations"; // <--- Add this import!
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function SavedJobsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchSavedJobs = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const savedIds = currentUser?.savedJobs || [];

      if (savedIds.length === 0) {
        setSavedJobs([]);
        setLoading(false);
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

      if (error) throw error;

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

  const openJob = (id) => {
    router.push({
      pathname: "/jobseekerModal/details/[id]",
      params: { id: String(id) },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* TopNav is back in its spot! */}
      <TopNav />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Saved Jobs</Text>
          <Text style={styles.subtitle}>
            Jobs you have bookmarked
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2623D3"
            style={{ marginTop: 40 }}
          />
        ) : savedJobs.length > 0 ? (
          savedJobs.map((job) => (
            <View
              key={job.id}
              style={{ marginBottom: 12 }}
            >
              <JobCard
                job={job}
                onPress={() => openJob(job.id)}
              />
            </View>
          ))
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
              paddingHorizontal: 20,
            }}
          >
            <Feather
              name="bookmark"
              size={48}
              color="#A1AAC0"
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#20233A",
                marginTop: 16,
              }}
            >
              No saved jobs yet
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#7D87A0",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 21,
              }}
            >
              Browse jobs on the Home tab and tap the
              bookmark icon to save the ones you like.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.navigate("/(tabs)/(jobseeker)")
              }
              style={{
                backgroundColor: "#2623D3",
                paddingVertical: 12,
                paddingHorizontal: 22,
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "600",
                }}
              >
                Browse Jobs
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FF",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#20233A",
  },
  subtitle: {
    fontSize: 14,
    color: "#7D87A0",
    marginTop: 4,
  },
});