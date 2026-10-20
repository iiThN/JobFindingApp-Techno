import { Feather, MaterialCommunityIcons, } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, } from "expo-router";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Alert } from "react-native"; // add to your react-native import
import styles from "../../components/stylesIn";
import { useApplications } from "../../context/ApplicationsContext";
import jobs from "../../data/jobs";

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { hasApplied, applyToJob } = useApplications();
  const applied = hasApplied(id);

  const handleApply = () => {
  const result = applyToJob(job.id);

  if (!result.success) {
    Alert.alert("Already applied", result.message);
    return;
  }

  Alert.alert("Application sent", "You can track it in the Applications tab.", [
    { text: "Stay here" },
    { text: "View applications", onPress: () => router.navigate("/jobApps") },
  ]);
};

  // gamit ang ID sa pagsearch sa jobs nga idisplay.
  const job = jobs.find((item) => String(item.id) === String(id));

  return (
    <SafeAreaView
      style={styles.detailsContainer}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FF"
      />

      <ScrollView
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsTop}>
          <TouchableOpacity
            style={styles.detailsBack}
            onPress={() => router.back()}
          >
            <Feather
              name="arrow-left"
              size={23}
              color="#14204A"
            />
          </TouchableOpacity>

          <Text style={styles.detailsTopTitle}>
            Job Details
          </Text>

          <View style={{ width: 42 }} />
        </View>

        {!job ? (
          <View style={styles.detailsPanel}>
            <Text style={styles.detailsTitle}>
              Job not found
            </Text>

            <Text style={styles.detailsBody}>
              No job matches ID: {String(id)}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.detailsHero}>
              <View
                style={[
                  styles.detailsLogo,
                  { backgroundColor: job.color },
                ]}
              >
                <MaterialCommunityIcons
                  name={job.icon}
                  size={36}
                  color="#2623D3"
                />
              </View>

              <Text style={styles.detailsTitle}>
                {job.title}
              </Text>

              <Text style={styles.detailsCompany}>
                {job.company}
              </Text>

              <View style={styles.detailsLocation}>
                <Feather
                  name="map-pin"
                  size={15}
                  color="#2623D3"
                />

                <Text style={styles.detailsBody}>
                  {job.location}
                </Text>
              </View>
            </View>

            {/* details sa trabaho. */}
            <View style={styles.detailsFacts}>
              <View style={styles.detailsFact}>
                <Feather
                  name="hash"
                  size={19}
                  color="#2623D3"
                />

                <Text style={styles.detailsFactLabel}>
                  Job ID
                </Text>

                <Text style={styles.detailsFactValue}>
                  {job.id}
                </Text>
              </View>

              <View style={styles.detailsFact}>
                <Feather
                  name="briefcase"
                  size={19}
                  color="#2623D3"
                />

                <Text style={styles.detailsFactLabel}>
                  Job Type
                </Text>

                <Text style={styles.detailsFactValue}>
                  {job.type}
                </Text>
              </View>
            </View>

            <View style={styles.detailsPanel}>
              <Text style={styles.detailsSectionTitle}>
                Salary
              </Text>

              <Text style={styles.detailsSalary}>
                {job.salary}
              </Text>
            </View>

            <View style={styles.detailsPanel}>
              <Text style={styles.detailsSectionTitle}>
                About this Job
              </Text>

              <Text style={styles.detailsBody}>
                {job.description}
              </Text>
            </View>

            <View style={styles.detailsPanel}>
              <Text style={styles.detailsSectionTitle}>
                Requirements
              </Text>

              {job.requirements.map((requirement, index) => (
                <Text
                  key={index}
                  style={styles.detailsRequirement}
                >
                  {"•  "}{requirement}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {job && (
        <View style={styles.detailsFooter}>
          <TouchableOpacity
            style={[styles.detailsApply, applied && { backgroundColor: "#A1AAC0" }]}
            activeOpacity={0.8}
            disabled={applied}
            onPress={handleApply}
          >
            <Text style={styles.detailsApplyText}>
              {applied ? "Applied" : "Apply Now"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}