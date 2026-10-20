
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "../../../components/Navigations";

import JobCard from "../../../components/JobCard";
import styles from "../../../components/stylesIn";
import { useAuth } from "../../../context/AuthContext";
import jobs from "../../../data/jobs";

export default function HomePage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const name = currentUser?.name?.split(" ")[0] || "there";

  // iopen ang details sa gipress/gipili nga trabaho.
  const openJob = (id) => {
    router.push({
      pathname: "/details/[id]",
      params: { id },
    });
  };

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

        {/* Search UI pa lang ni, walay function. */}
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
              editable={true}
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

        {/* Mga recommended jobs. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.homeHorizontal}
        >
          {jobs.slice(0, 2).map((job) => (
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

        {/* new job listing. */}
        {jobs.slice(2).map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPress={() => openJob(job.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
