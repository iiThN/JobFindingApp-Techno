import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import JobCard from "../../../components/JobCard";
import styles from "../../../components/stylesIn";
import { supabase } from "../../../lib/supabase";

export default function SearchedDisplay() {
  const router = useRouter();
  const { query = "", jobType = "All", location = "", skill = "" } =
    useLocalSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchFilteredJobs = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("jobLists")
        .select(`
          *,
          profiles:employer_id (
            name
          )
        `)
        .eq("status", "Open")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (!error && data) {
        const formatted = data.map((job) => ({
          ...job,
          company: job.profiles?.name || "Employer",
          company_name: job.profiles?.name || "Employer",
          type: job.job_type,
          icon: "briefcase-outline",
          color: "#EEF2FF",
        }));

        // Filter results locally
        const filtered = formatted.filter((job) => {
          const keyword = String(query).toLowerCase().trim();
          const searchText = [job.title, job.company, job.location, job.skills]
            .map((val) =>
              Array.isArray(val) ? val.join(" ") : String(val || "")
            )
            .join(" ")
            .toLowerCase();

          const type = String(job.job_type || job.type || "").toLowerCase();
          const selectedType = String(jobType).toLowerCase();
          const matchesType =
            selectedType === "all" ||
            (selectedType === "internship / ojt"
              ? type.includes("internship") || type.includes("ojt")
              : type.replace(/[\s-]/g, "") === selectedType.replace(/[\s-]/g, ""));

          const matchesLocation =
            !location.trim() ||
            String(job.location || "")
              .toLowerCase()
              .includes(location.trim().toLowerCase());

          const matchesSkill =
            !skill.trim() ||
            String(
              Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || ""
            )
              .toLowerCase()
              .includes(skill.trim().toLowerCase());

          return (
            (!keyword || searchText.includes(keyword)) &&
            matchesType &&
            matchesLocation &&
            matchesSkill
          );
        });

        setJobs(filtered);
      } else {
        setJobs([]);
      }

      setLoading(false);
    };

    fetchFilteredJobs();

    return () => {
      active = false;
    };
  }, [query, jobType, location, skill]);

  const openSearchModal = () => {
    router.push({
      pathname: "/jobseekerModal/search/searchModal",
      params: { query, jobType, location, skill },
    });
  };

  const openJobDetails = (id) => {
    router.push({
      pathname: "/jobseekerModal/details/[id]",
      params: { id: String(id) },
    });
  };

  const activeFilters = [
    jobType !== "All" && jobType,
    location.trim() && `Location: ${location}`,
    skill.trim() && `Skill: ${skill}`,
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Search Bar Header */}
      <View style={[styles.employerModalTopBar, { gap: 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color="#111C4B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeSearchBox}
          activeOpacity={0.8}
          onPress={openSearchModal}
        >
          <Feather name="search" size={18} color="#7D87A0" />
          <Text
            style={[
              styles.homeSearchInput,
              { color: query ? "#111C4B" : "#9299AB" },
            ]}
            numberOfLines={1}
          >
            {query || "Search job title, skill or company..."}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeFilter}
          onPress={openSearchModal}
        >
          <Feather name="sliders" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Filters Display Chips */}
        {activeFilters.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {activeFilters.map((filterText, index) => (
              <View key={index} style={styles.employerSkillPill}>
                <Text style={styles.employerSkillPillText}>{filterText}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Results Header */}
        <View style={styles.homeSectionHeader}>
          <Text style={styles.homeHeading}>
            {loading ? "Searching..." : `${jobs.length} Jobs Found`}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2623D3" style={{ marginTop: 40 }} />
        ) : jobs.length > 0 ? (
          <View style={{ gap: 12 }}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => openJobDetails(job.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.jobAppsEmptyContainer}>
            <Feather name="search" size={48} color="#A1AAC0" />
            <Text style={styles.jobAppsEmptyTitle}>No matching jobs</Text>
            <Text style={styles.jobAppsEmptyBody}>
              Try adjusting your keywords or clearing some filters.
            </Text>
            <TouchableOpacity
              style={styles.jobAppsEmptyButton}
              onPress={openSearchModal}
            >
              <Text style={styles.jobAppsEmptyButtonText}>Modify Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}