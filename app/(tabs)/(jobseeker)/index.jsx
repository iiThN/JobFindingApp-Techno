
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import JobCard from "../../../components/JobCard";
import JobFilterModal from "../../../components/JobFilterModal";
import { TopNav } from "../../../components/Navigations";
import styles from "../../../components/stylesIn";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    jobType: "All",
    location: "",
    skill: "",
  });

  const name = currentUser?.name?.split(" ")[0] || "there";

  // Kuhaon ang open jobs gikan sa Supabase.
  const fetchJobs = async () => {
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

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    // I-convert ang database fields para sa JobCard.
    const formattedJobs = (data || []).map((job) => ({
      ...job,
      company: job.profiles?.name || "Employer",
      type: job.job_type,
      icon: "briefcase-outline",
      color: "#E9ECFF",
    }));

    setJobs(formattedJobs);
    setLoading(false);
  };

  // I-refresh ang jobs kada balik sa Home.
  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const openJob = (id) => {
    router.push({
      pathname: "/jobseekerModal/details/[id]",
      params: { id },
    });
  };

  // Search and filter the jobs already loaded from Supabase.
  const filteredJobs = jobs.filter((job) => {
    const keyword = search.toLowerCase().trim();
    const searchText = [job.title, job.company, job.location, job.skills]
      .map((value) => Array.isArray(value) ? value.join(" ") : String(value || ""))
      .join(" ")
      .toLowerCase();

    const type = String(job.job_type || job.type || "").toLowerCase();
    const selectedType = filters.jobType.toLowerCase();
    const matchesType = selectedType === "all" ||
      (selectedType === "internship / ojt"
        ? type.includes("internship") || type.includes("ojt")
        : type.replace(/[\s-]/g, "") === selectedType.replace(/[\s-]/g, ""));
    const matchesLocation = !filters.location.trim() ||
      String(job.location || "").toLowerCase().includes(filters.location.trim().toLowerCase());
    const matchesSkill = !filters.skill.trim() ||
      String(Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || "")
        .toLowerCase().includes(filters.skill.trim().toLowerCase());

    return (!keyword || searchText.includes(keyword)) && matchesType && matchesLocation && matchesSkill;
  });

  const activeFilterCount = [
    filters.jobType !== "All",
    Boolean(filters.location.trim()),
    Boolean(filters.skill.trim()),
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.homeContainer} edges={["top"]}>
      <TopNav />

      <JobFilterModal
        visible={filterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(nextFilters) => { setFilters(nextFilters); setFilterVisible(false); }}
        onReset={() => { setFilters({ jobType: "All", location: "", skill: "" }); setFilterVisible(false); }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeContent}
      >
        <View style={styles.homeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeMorning}>
              Good morning,
            </Text>

            <Text style={styles.homeGreeting}>
              Hi, {name}! 👋
            </Text>

            <Text style={styles.homeSubtitle}>
              Find the right job for your next chapter.
            </Text>
          </View>
        </View>

        <View style={styles.homeSearchRow}>
          <View style={styles.homeSearchBox}>
            <Feather
              name="search"
              size={20}
              color="#7D87A0"
            />

            <TextInput
              style={styles.homeSearchInput}
              placeholder="Job title, skill or company"
              placeholderTextColor="#9299AB"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.homeFilter}
            onPress={() => setFilterVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open job filters"
          >
            <Feather name="sliders" size={21} color="#FFFFFF" />
            {activeFilterCount > 0 && (
              <View style={{ position: "absolute", top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#FFB547", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#111C4B", fontSize: 10, fontWeight: "800" }}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2623D3"
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            <View style={styles.homeSectionHeader}>
              <View style={styles.homeHeadingRow}>
                <MaterialCommunityIcons
                  name="creation"
                  size={22}
                  color="#2623D3"
                />

                <Text style={styles.homeHeading}>
                  Recommended for you
                </Text>
              </View>

              <TouchableOpacity onPress={() => router.push({
                pathname: "/jobseekerModal/allJobList",
                params: { title: "Recommended Jobs" }
              })}>
                <Text style={styles.homeSeeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.homeHorizontal}
            >
              {filteredJobs.slice(0).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  featured={true}
                  onPress={() => openJob(job.id)}
                />
              ))}
            </ScrollView>

            <View
              style={[
                styles.homeSectionHeader,
                { marginTop: 27 },
              ]}
            >
              <View style={styles.homeHeadingRow}>
                <Feather
                  name="briefcase"
                  size={21}
                  color="#2623D3"
                />

                <Text style={styles.homeHeading}>
                  Latest jobs
                </Text>
              </View>

              <TouchableOpacity onPress={() => router.push({
                pathname: "/jobseekerModal/allJobList",
                params: { title: "Latest Jobs" }
              })}>
                <Text style={styles.homeSeeAll}>See all</Text>
              </TouchableOpacity>

            </View>
            <View style={{gap: 12}}>
              {filteredJobs.slice(0).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => openJob(job.id)}
                />
              ))}

              {filteredJobs.length === 0 && (
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 30,
                    color: "#7381A2",
                  }}
                >
                  No jobs found.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
