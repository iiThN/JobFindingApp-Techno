import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const QUICK_CATEGORIES = [
  { label: "Internship / OJT", type: "Internship / OJT" },
  { label: "Full-Time", type: "Full-Time" },
  { label: "Part-Time", type: "Part-Time" },
  { label: "Contract", type: "Contract" },
];

export default function HomePageOption1() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const name = currentUser?.name?.split(" ")[0] || "there";

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

    const formattedJobs = (data || []).map((job) => ({
      ...job,
      company: job.profiles?.name || "Employer",
      company_name: job.profiles?.name || "Employer",
      type: job.job_type,
      icon: "briefcase-outline",
      color: "#E9ECFF",
    }));

    setJobs(formattedJobs);
    setLoading(false);
  };

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

  const openCategorySearch = (type) => {
    router.push({
      pathname: "/jobseekerModal/search/searchedDisplay",
      params: { jobType: type },
    });
  };

  return (
    <SafeAreaView style={styles.homeContainer} edges={["top"]}>
      <TopNav />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeContent}
      >
        {/* Header Greeting */}
        <View style={styles.homeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.homeMorning}>Good morning,</Text>
            <Text style={styles.homeGreeting}>Hi, {name}! 👋</Text>
            <Text style={styles.homeSubtitle}>
              Find verified student-friendly jobs & OJT placements.
            </Text>
          </View>
        </View>

        {/* Quick Category Pills */}
        <View style={{ marginTop: 20, marginBottom: 25 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#7381A2",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Quick Categories
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {QUICK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.type}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EEF0F8",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 50,

                }}
                activeOpacity={0.7}
                onPress={() => openCategorySearch(cat.type)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: "#2623D3",
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2623D3"
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* Recommended Jobs */}
            <View style={styles.homeSectionHeader}>
              <View style={styles.homeHeadingRow}>
                <MaterialCommunityIcons name="creation" size={22} color="#2623D3" />
                <Text style={styles.homeHeading}>Recommended for you</Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/jobseekerModal/allJobList",
                    params: { title: "Recommended Jobs" },
                  })
                }
              >
                <Text style={styles.homeSeeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.homeHorizontal}
            >
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  featured={true}
                  onPress={() => openJob(job.id)}
                />
              ))}
            </ScrollView>

            {/* Latest Jobs */}
            <View style={[styles.homeSectionHeader, { marginTop: 27 }]}>
              <View style={styles.homeHeadingRow}>
                <Feather name="briefcase" size={21} color="#2623D3" />
                <Text style={styles.homeHeading}>Latest jobs</Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/jobseekerModal/allJobList",
                    params: { title: "Latest Jobs" },
                  })
                }
              >
                <Text style={styles.homeSeeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => openJob(job.id)}
                />
              ))}

              {jobs.length === 0 && (
                <Text style={{ textAlign: "center", marginTop: 30, color: "#7381A2" }}>
                  No jobs available right now.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}