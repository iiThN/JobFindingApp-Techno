import { Feather, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
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

import styles from "../../../components/stylesIn";
import { useApplications } from "../../../context/ApplicationsContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser, toggleBookmark } = useAuth();

  const { hasApplied } = useApplications();
  const applied = hasApplied(id);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const savedJobs = currentUser?.savedJobs || [];
  const isSaved = savedJobs.some((savedId) => String(savedId) === String(id));

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchJob = async () => {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("jobLists")
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
      pathname: "/jobseekerModal/apply/[id]",
      params: { id: String(id) },
    });
  };

  const requirements = job?.requirements
    ? job.requirements.split(/,|\n/).map((r) => r.trim()).filter(Boolean)
    : [];

  const skills = job?.skills
    ? job.skills.split(/,|\n/).map((s) => s.trim()).filter(Boolean)
    : [];

    const companyName = job?.company_name || "Employer";
    const companyInitial = companyName.charAt(0).toUpperCase();

  return (
    <SafeAreaView
      style={[styles.detailsContainer, { backgroundColor: "#2623D3" }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2623D3"
      />

      <View style={styles.detailsHeaderBanner}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.detailsHeaderTitle}>
          Job Details
        </Text>

        <TouchableOpacity
          onPress={() => toggleBookmark(id)}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? "Remove saved job" : "Save job"}
        >
          <MaterialCommunityIcons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isSaved ? "#FFD166" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.detailsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={{ marginTop: 40 }}
          />
        ) : !job ? (
          <View style={[styles.detailsPanel, { borderWidth: 1, borderColor: "#EEF0F8", marginTop: 20 }]}>
            <Text style={styles.detailsTitle}>
              Job not found
            </Text>
            <Text style={styles.detailsBody}>
              {errorMessage || "This job is unavailable."}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.jobDetailsCard}>
              <View style={styles.jobDetailsPfp}>
                <Text style={styles.jobDetailsInitialText}>
                  {companyInitial}
                </Text>
              </View>
              <View style={{
                backgroundColor: job.status?.toLowerCase() === "open" ? "#ccf2e0" : "#ffd3d3",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                alignSelf: "flex-end"
              }}>
                <Text style={{
                  color: job.status?.toLowerCase() === "open" ? "#166534" : "#991B1B",
                  fontSize: 11,
                  fontWeight: "700"
                }}>
                  {job.status?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.jobDetailsTitle}>
                {job.title}
              </Text>

              <Text style={styles.jobDetailsCompany}>
                {companyName}
              </Text>


              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <FontAwesome6 name="location-dot" size={13} color="#7D87A0" />
                <Text style={{ color: "#7D87A0", fontSize: 13 }}>
                  {job.location}
                </Text>
              </View>
              <View style={styles.detailsStatsRow}>
              {/* Salary Box */}
              <View style={styles.detailsStatBox}>
                <View style={styles.detailsStatIconBox}>
                  <MaterialCommunityIcons name="wallet-outline" size={18} color="#2623D3" />
                </View>
                <View>
                  <Text style={styles.detailsStatLabel}>
                    Salary (Monthly)
                  </Text>
                  <Text style={styles.detailsStatValue}>
                    ${job.salary} <Text style={{ fontSize: 11, color: "#8590A5", fontWeight: "400" }}>/ mo</Text>
                  </Text>
                </View>
              </View>

              {/* Employment Type Box */}
              <View style={styles.detailsStatBox}>
                <View style={styles.detailsStatIconBox}>
                  <Feather name="briefcase" size={18} color="#2623D3" />
                </View>
                <View>
                  <Text style={styles.detailsStatLabel}>
                    Employment Type
                  </Text>
                  <Text style={styles.detailsStatValue}>
                    {job.job_type || "Full-Time"}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.detailsCardSection}>
              <View style={styles.detailsSectionHeaderRow}>
                <Feather name="file-text" size={18} color="#2623D3" />
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111C4B" }}>
                  About the Role
                </Text>
              </View>

              <Text style={{ fontSize: 13, color: "#56617B", lineHeight: 20 }}>
                {job.description || "No description provided."}
              </Text>
            </View>

            {/* 4. Requirements & Credentials */}
            <View style={styles.detailsCardSection}>
              <View style={styles.detailsSectionHeaderRow}>
                <Feather name="check-circle" size={18} color="#2623D3" />
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111C4B" }}>
                  Requirements & Credentials
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                {requirements.length > 0 ? (
                  requirements.map((req, index) => (
                    <View key={index} style={styles.detailsReqItemBox}>
                      <View style={styles.detailsReqCheckCircle}>
                        <Feather name="check" size={11} color="#FFFFFF" />
                      </View>
                      <Text style={{ fontSize: 13, color: "#111C4B", fontWeight: "500", flex: 1 }}>
                        {req}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 13, color: "#7381A2" }}>
                    No requirements specified.
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.detailsCardSection}>
              <View style={styles.detailsSectionHeaderRow}>
                <MaterialCommunityIcons name="code-tags" size={18} color="#2623D3" />
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#111C4B" }}>
                  Key Skill Requirements
                </Text>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <View key={index} style={styles.detailsSkillBadge}>
                      <Text style={styles.detailsSkillBadgeText}>
                        {skill}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 13, color: "#7381A2" }}>
                    No skills specified.
                  </Text>
                )}
              </View>
            </View>

            </View>


            
          </>
        )}
      </ScrollView>

      {job?.status === "Open" && (
        <View style={[styles.detailsFooter, { backgroundColor: "#F6F8FF", padding: 16 }]}>
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