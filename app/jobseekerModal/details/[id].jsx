
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
  const isSaved = savedJobs.some(
    (savedId) => String(savedId) === String(id)
  );

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

  // Convert job requirements into an array
  const requirements = Array.isArray(job?.requirements)
    ? job.requirements
    : job?.requirements
      ? job.requirements.split(/,|\n/).map((r) => r.trim()).filter(Boolean)
      : [];

  // Convert job skills into an array
  const skills = Array.isArray(job?.skills)
    ? job.skills
    : job?.skills
      ? job.skills.split(/,|\n/).map((s) => s.trim()).filter(Boolean)
      : [];

  // Get the skills saved in the Job Seeker's profile
  const profileSkills = Array.isArray(currentUser?.skills)
    ? currentUser.skills
    : [];

  // Compare skills without considering uppercase/lowercase
  const normalizedProfileSkills = profileSkills.map((skill) =>
    String(skill).trim().toLowerCase()
  );

  // Identify matched skills
  const matchedSkills = skills.filter((skill) =>
    normalizedProfileSkills.includes(String(skill).trim().toLowerCase())
  );

  const missingSkills = skills.filter(
    (skill) =>
      !normalizedProfileSkills.includes(String(skill).trim().toLowerCase())
  );

  const matchPercentage =
    skills.length > 0
      ? Math.round((matchedSkills.length / skills.length) * 100)
      : 0;

  const companyName =
    job?.profiles?.name || job?.company_name || "Employer";

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
            color={isSaved ? "#FFD166" : "#c2cade"}
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
          <View
            style={[
              styles.detailsPanel,
              {
                borderWidth: 1,
                borderColor: "#EEF0F8",
                marginTop: 20,
              },
            ]}
          >
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

              <View
                style={{
                  backgroundColor:
                    job.status?.toLowerCase() === "open"
                      ? "#ccf2e0"
                      : "#ffd3d3",
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderTopEndRadius: 20,
                  borderBottomStartRadius: 20,
                  alignSelf: "flex-end",
                }}
              >
                <Text
                  style={{
                    color:
                      job.status?.toLowerCase() === "open"
                        ? "#166534"
                        : "#991B1B",
                    fontSize: 12,
                    fontWeight: "700",

                  }}
                >
                  {job.status?.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.jobDetailsTitle}>
                {job.title}
              </Text>

              <Text style={styles.jobDetailsCompany}>
                {companyName}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  alignSelf: "center"
                }}
              >
                <FontAwesome6
                  name="location-dot"
                  size={13}
                  color="#7D87A0"
                />
                <Text style={{ color: "#7D87A0", fontSize: 13 }}>
                  {job.location}
                </Text>
              </View>
              <View style={{flexDirection:'column', gap: 12, padding: 12, alignItems: "stretch"}}>
                <View style={styles.detailsStatsRow}>
                  {/* Salary Box */}
                  <View style={styles.detailsStatBox}>
                    <View style={styles.detailsStatIconBox}>
                      <MaterialCommunityIcons
                        name="wallet-outline"
                        size={18}
                        color="#2623D3"
                      />
                    </View>

                    <View>
                      <Text style={styles.detailsStatLabel}>
                        Salary (Monthly)
                      </Text>
                      <Text style={styles.detailsStatValue}>
                      ₱{job.salary}
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#8590A5",
                            fontWeight: "400",
                          }}
                        >
                          {" "}/ mo
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Employment Type Box */}
                  <View style={styles.detailsStatBox}>
                    <View style={styles.detailsStatIconBox}>
                      <Feather
                        name="briefcase"
                        size={18}
                        color="#2623D3"
                      />
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
                    <Feather
                      name="file-text"
                      size={18}
                      color="#2623D3"
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#111C4B",
                      }}
                    >
                      About the Role
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      color: "#56617B",
                      lineHeight: 20,
                    }}
                  >
                    {job.description || "No description provided."}
                  </Text>
                </View>

                {/* Requirements & Credentials */}
                <View style={styles.detailsCardSection}>
                  <View style={styles.detailsSectionHeaderRow}>
                    <Feather
                      name="check-circle"
                      size={18}
                      color="#2623D3"
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#111C4B",
                      }}
                    >
                      Requirements & Credentials
                    </Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    {requirements.length > 0 ? (
                      requirements.map((req, index) => (
                        <View
                          key={index}
                          style={styles.detailsReqItemBox}
                        >
                          <View style={styles.detailsReqCheckCircle}>
                            <Feather
                              name="check"
                              size={11}
                              color="#FFFFFF"
                            />
                          </View>

                          <Text
                            style={{
                              fontSize: 13,
                              color: "#111C4B",
                              fontWeight: "500",
                              flex: 1,
                            }}
                          >
                            {req}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#7381A2",
                        }}
                      >
                        No requirements specified.
                      </Text>
                    )}
                  </View>
                </View>

                {/* Skill Matching Checklist */}
                <View style={styles.detailsCardSection}>
                  <View style={styles.detailsSectionHeaderRow}>
                    <MaterialCommunityIcons
                      name="clipboard-check-outline"
                      size={19}
                      color="#2623D3"
                    />

                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#111C4B",
                      }}
                    >
                      Skill Matching Checklist
                    </Text>
                  </View>

                  {skills.length > 0 ? (
                    <>
                      {/* Match Percentage */}
                      <View
                        style={{
                          backgroundColor: "#F2F4FF",
                          padding: 14,
                          borderRadius: 12,
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#56617B",
                            }}
                          >
                            Your Skill Match
                          </Text>

                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "800",
                              color: "#2623D3",
                            }}
                          >
                            {matchPercentage}%
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View
                          style={{
                            height: 9,
                            backgroundColor: "#DDE1F0",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              width: `${matchPercentage}%`,
                              height: "100%",
                              backgroundColor: "#2623D3",
                              borderRadius: 10,
                            }}
                          />
                        </View>

                        <Text
                          style={{
                            fontSize: 12,
                            color: "#56617B",
                          }}
                        >
                          {matchedSkills.length} of {skills.length} required
                          skills matched
                        </Text>
                      </View>

                      {/* Checklist */}
                      <View style={{ gap: 10, marginTop: 14 }}>
                        {skills.map((skill, index) => {
                          const isMatched =
                            normalizedProfileSkills.includes(
                              String(skill).trim().toLowerCase()
                            );

                          return (
                            <View
                              key={`${skill}-${index}`}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 12,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: isMatched
                                  ? "#B7E4CC"
                                  : "#E4E7F0",
                                backgroundColor: isMatched
                                  ? "#F0FAF4"
                                  : "#FFFFFF",
                                gap: 10,
                              }}
                            >
                              <Feather
                                name={
                                  isMatched
                                    ? "check-circle"
                                    : "circle"
                                }
                                size={19}
                                color={
                                  isMatched ? "#16A34A" : "#A1AAC0"
                                }
                              />

                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: 13,
                                  fontWeight: "600",
                                  color: "#111C4B",
                                }}
                              >
                                {skill}
                              </Text>

                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "700",
                                  color: isMatched
                                    ? "#15803D"
                                    : "#8993A8",
                                }}
                              >
                                {isMatched ? "MATCHED" : "NOT MATCHED"}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      {/* Missing Skills */}
                      {missingSkills.length > 0 && (
                        <View
                          style={{
                            marginTop: 14,
                            padding: 12,
                            backgroundColor: "#FFF8E8",
                            borderRadius: 10,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: "#946200",
                              marginBottom: 5,
                            }}
                          >
                            Skills not yet listed in your profile
                          </Text>

                          <Text
                            style={{
                              fontSize: 12,
                              color: "#80652C",
                              lineHeight: 19,
                            }}
                          >
                            {missingSkills.join(", ")}
                          </Text>
                        </View>
                      )}

                      {profileSkills.length === 0 && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#7381A2",
                            marginTop: 12,
                            lineHeight: 18,
                          }}
                        >
                          You haven't added any skills to your profile yet.
                          Add your skills in your profile to see your match.
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#7381A2",
                      }}
                    >
                      No skills specified for this job.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {job?.status === "Open" && (
        <View
          style={[
            styles.detailsFooter,
            {
              backgroundColor: "#F6F8FF",
              padding: 16,
            },
          ]}
        >
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
