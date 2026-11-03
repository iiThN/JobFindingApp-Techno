import { Feather } from "@expo/vector-icons";
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

import JobCard from "../../../components/JobCard";
import { TopNav } from "../../../components/Navigations";
import styles from "../../../components/stylesIn";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function SavedJobs() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedIds = currentUser?.savedJobs || [];

  const fetchSavedJobs = async () => {
    if (!savedIds || savedIds.length === 0) {
      setSavedJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("jobLists")
      .select(`
        *,
        profiles:employer_id (
          name
        )
      `)
      .in("id", savedIds);

    if (!error && data) {
      const formattedJobs = data.map((job) => ({
        ...job,
        company: job.profiles?.name || "Employer",
        type: job.job_type,
        icon: "briefcase-outline",
        color: "#E9ECFF",
      }));
      setSavedJobs(formattedJobs);
    }
    setLoading(false);
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
    <View style={styles.container}>
      <SafeAreaView
        style={styles.homeContainer}
        edges={["top"]}
      >
        <TopNav />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: "#20233A",
              }}
            >
              Saved Jobs
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#7D87A0",
                marginTop: 6,
              }}
            >
              {savedJobs.length}{" "}
              {savedJobs.length === 1 ? "job" : "jobs"} saved
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
    </View>
  );
}