
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
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
import jobs from "../../../data/jobseeker_data/jobs";

export default function SavedJobs() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const savedIds = currentUser?.savedJobs || [];

  const savedJobs = jobs.filter((job) =>
    savedIds.some(
      (savedId) => String(savedId) === String(job.id)
    )
  );

  const openJob = (id) => {
    router.push({
      pathname: "/details/[id]",
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

          {savedJobs.length > 0 ? (
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
