import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import JobCard from "../../components/JobCard";
import JobFilterModal from "../../components/JobFilterModal";
import styles from "../../components/stylesIn";
import { supabase } from "../../lib/supabase";

export default function AllJobList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const title = params.title || "All Jobs";

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    jobType: "All",
    location: "",
    skill: "",
  });

  const fetchAllJobs = async () => {
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

    const formattedJobs = (data || []).map((job) => ({
      ...job,
      company_name: job.profiles?.name || "Employer",
      type: job.job_type,
      icon: "briefcase-outline",
      color: "#E9ECFF",
    }));

    setJobs(formattedJobs);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const openJob = (id) => {
    router.push({
      pathname: "/jobseekerModal/details/[id]",
      params: { id },
    });
  };

  // Search and filter the jobs already loaded from Supabase.
  const filteredJobs = jobs.filter((job) => {
    const keyword = search.toLowerCase().trim();
    const searchText = [job.title, job.company_name, job.location, job.skills]
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
      {/* Top Header with Back Button */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 19,
        paddingVertical: 14,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderColor: "#EEF0F8",
        gap: 12
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#F6F8FF",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#EEF0F8"
          }}
        >
          <Feather name="arrow-left" size={20} color="#111C4B" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#111C4B" }}>
          {title}
        </Text>
      </View>

      <JobFilterModal
        visible={filterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(nextFilters) => { setFilters(nextFilters); setFilterVisible(false); }}
        onReset={() => { setFilters({ jobType: "All", location: "", skill: "" }); setFilterVisible(false); }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.homeContent, { paddingTop: 20 }]}
      >
        {/* Search Bar */}
        <View style={[styles.homeSearchRow, { marginTop: 0 }]}>
          <View style={styles.homeSearchBox}>
            <Feather name="search" size={20} color="#7D87A0" />
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
          <View style={{ gap: 12 }}>
            {filteredJobs.map((job) => (
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
                  marginTop: 40,
                  color: "#7381A2",
                  fontSize: 14,
                }}
              >
                No jobs found matching your search.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}