
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import styles from "../../components/stylesIn";
import { useApplications } from "../../context/ApplicationsContext";
import { supabase } from "../../lib/supabase";

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { hasApplied } = useApplications();
  const applied = hasApplied(id);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Kuhaon ang job details gamit ang UUID.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchJob = async () => {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            profiles:employer_id (
              name
            )
          `)
          .eq("id", id)
          .maybeSingle();

        if (!active) return;

        if (error) {
          setErrorMessage(error.message);
          setJob(null);
        } else {
          setJob(data);
        }

        setLoading(false);
      };

      if (id) {
        fetchJob();
      } else {
        setJob(null);
        setLoading(false);
      }

      return () => {
        active = false;
      };
    }, [id])
  );

  const handleApply = () => {
    router.push({
      pathname: "/apply/[id]",
      params: { id: String(id) },
    });
  };

  const requirements = job?.requirements
    ? job.requirements.split(/,|\n/).map((r) => r.trim()).filter(Boolean)
    : [];

  const skills = job?.skills
    ? job.skills.split(/,|\n/).map((s) => s.trim()).filter(Boolean)
    : [];

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

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2623D3"
            style={{ marginTop: 40 }}
          />
        ) : !job ? (
          <View style={styles.detailsPanel}>
            <Text style={styles.detailsTitle}>
              Job not found
            </Text>

            <Text style={styles.detailsBody}>
              {errorMessage || "This job is unavailable."}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.detailsHero}>
              <View
                style={[
                  styles.detailsLogo,
                  { backgroundColor: "#E9ECFF" },
                ]}
              >
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={36}
                  color="#2623D3"
                />
              </View>

              <Text style={styles.detailsTitle}>
                {job.title}
              </Text>

              <Text style={styles.detailsCompany}>
                {job.profiles?.name || "Employer"}
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

            <View style={styles.detailsFacts}>
              <View style={styles.detailsFact}>
                <Feather name="briefcase" size={19} color="#2623D3" />
                <Text style={styles.detailsFactLabel}>Employment Type</Text>
                <Text style={styles.detailsFactValue}>{job.job_type}</Text>
              </View>
            </View>

            <View style={styles.detailsPanel}>
              <Text style={styles.detailsSectionTitle}>
                Salary
              </Text>

              <Text style={styles.detailsSalary}>
                {job.salary || "Not specified"}
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

              {requirements.length > 0 ? (
                requirements.map((requirement, index) => (
                  <Text
                    key={index}
                    style={styles.detailsRequirement}
                  >
                    {"•  "}{requirement}
                  </Text>
                ))
              ) : (
                <Text style={styles.detailsBody}>
                  No requirements specified.
                </Text>
              )}
            </View>

            <View style={styles.detailsPanel}>
              <Text style={styles.detailsSectionTitle}>
                Key Skills
              </Text>

              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <Text
                    key={index}
                    style={styles.detailsRequirement}
                  >
                    {"•  "}{skill}
                  </Text>
                ))
              ) : (
                <Text style={styles.detailsBody}>
                  No skills specified.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {job?.status === "Open" && (
        <View style={styles.detailsFooter}>
          <TouchableOpacity
            style={[
              styles.detailsApply,
              applied && { backgroundColor: "#A1AAC0" },
            ]}
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
