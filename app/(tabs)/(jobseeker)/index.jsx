
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

  const name = currentUser?.name?.split(" ")[0] || "there";

  // Kuhaon ang open jobs gikan sa Supabase.
  const fetchJobs = async () => {
    setLoading(true);

  const { data, error } = await supabase
    .from("jobs")
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
      pathname: "/details/[id]",
      params: { id },
    });
  };

  // Pangita base sa title, company, location, o skills.
  const filteredJobs = jobs.filter((job) => {
    const keyword = search.toLowerCase().trim();

    return (
      job.title?.toLowerCase().includes(keyword) ||
      job.company?.toLowerCase().includes(keyword) ||
      job.location?.toLowerCase().includes(keyword) ||
      job.skills?.toLowerCase().includes(keyword)
    );
  });

  return (
    <SafeAreaView style={styles.homeContainer} edges={["top"]}>
      <TopNav />

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
            accessibilityLabel="Filters (coming soon)"
          >
            <Feather
              name="sliders"
              size={21}
              color="#FFFFFF"
            />
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

              <Text style={styles.homeSeeAll}>
                See all
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.homeHorizontal}
            >
              {filteredJobs.slice(0, 2).map((job) => (
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

              <Text style={styles.homeSeeAll}>
                See all
              </Text>
            </View>

            {filteredJobs.slice(2).map((job) => (
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
