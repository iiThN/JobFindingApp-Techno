
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import styles from "./stylesIn";

export default function JobCard({
  job,
  featured = false,
  onPress,
}) {
  const { currentUser, updateCurrentUser } = useAuth();

  const savedJobs = currentUser?.savedJobs || [];

  const isSaved = savedJobs.some(
    (savedId) => String(savedId) === String(job.id)
  );

  const toggleSaved = () => {
    if (!currentUser) return;

    const updatedSavedJobs = isSaved
      ? savedJobs.filter(
          (savedId) => String(savedId) !== String(job.id)
        )
      : [...savedJobs, String(job.id)];

    updateCurrentUser({
      savedJobs: updatedSavedJobs,
      savedCount: updatedSavedJobs.length,
    });
  };

  if (featured) {
    return (
      <View style={styles.jobCardFeatured}>
        <View style={styles.jobCardFeaturedTop}>
          <View style={styles.jobCardFeaturedIcon}>
            <MaterialCommunityIcons
              name={job.icon}
              size={25}
              color="#2623D3"
            />
          </View>

          <TouchableOpacity
            onPress={toggleSaved}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              isSaved ? "Remove saved job" : "Save job"
            }
          >
            <Feather
              name="bookmark"
              size={23}
              color={isSaved ? "#FFD166" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          style={{ flex: 1 }}
        >
          <Text
            style={styles.jobCardFeaturedTitle}
            numberOfLines={2}
          >
            {job.title}
          </Text>

          <Text
            style={styles.jobCardFeaturedCompany}
            numberOfLines={1}
          >
            {job.company} · {job.location}
          </Text>

          <View style={styles.jobCardFeaturedBottom}>
            <Text style={styles.jobCardFeaturedTag}>
              {job.type}
            </Text>

            <Text
              style={styles.jobCardFeaturedSalary}
              numberOfLines={1}
            >
              {job.salary}
            </Text>

            <Feather
              name="arrow-up-right"
              size={20}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.jobCardCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={[
            styles.jobCardIconBox,
            { backgroundColor: job.color },
          ]}
        >
          <MaterialCommunityIcons
            name={job.icon}
            size={25}
            color="#2623D3"
          />
        </View>

        <View style={styles.jobCardInfo}>
          <Text
            style={styles.jobCardTitle}
            numberOfLines={2}
          >
            {job.title}
          </Text>

          <Text
            style={styles.jobCardCompany}
            numberOfLines={1}
          >
            {job.company} · {job.location}
          </Text>

          <View style={styles.jobCardMeta}>
            <Text style={styles.jobCardTag}>
              {job.type}
            </Text>

            <Text
              style={styles.jobCardSalary}
              numberOfLines={1}
            >
              {job.salary}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggleSaved}
        hitSlop={10}
        style={{ padding: 5 }}
        accessibilityRole="button"
        accessibilityLabel={
          isSaved ? "Remove saved job" : "Save job"
        }
      >
        <Feather
          name="bookmark"
          size={21}
          color={isSaved ? "#2623D3" : "#A1AAC0"}
        />
      </TouchableOpacity>
    </View>
  );
}
