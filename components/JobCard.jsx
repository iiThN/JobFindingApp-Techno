import { FontAwesome6, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import styles from "./stylesIn";

export function getTimeAgo(dateString) {
  if (!dateString) return "";
  
  const now = new Date();
  const created = new Date(dateString);
  const diffInSeconds = Math.floor((now - created) / 1000);
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else if (diffInMonths === 1) {
    return "1 month ago";
  } else if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  } else if (diffInYears === 1) {
    return "1 year ago";
  } else {
    return `${diffInYears} years ago`;
  }
}

export default function JobCard({
  job,
  featured = false,
  onPress,
}) {
  const { currentUser, toggleBookmark } = useAuth();

  const savedJobs = currentUser?.savedJobs || [];

  const isSaved = savedJobs.some(
    (savedId) => String(savedId) === String(job.id)
  );

  const handleToggle = () => {
    toggleBookmark(job.id);
  };

  if (featured) {
    return (
      <View style={styles.jobCardFeatured}>
        <View style={styles.jobCardFeaturedTop}>
          <View style={styles.jobCardFeaturedIcon}>
            <MaterialCommunityIcons
              name={job.icon || "briefcase-outline"}
              size={25}
              color="#2623D3"
            />
          </View>
          <View style={{ flexDirection:"column", flex: 1, justifyContent: "space-between", gap:6}}>
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
              { job.company_name}
            </Text>
          </View>
          <TouchableOpacity
            style={{ alignSelf: "flex-start"}}
            onPress={handleToggle}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              isSaved ? "Remove saved job" : "Save job"
            }
          >
            <MaterialCommunityIcons
              name={isSaved ? "bookmark" : "bookmark-outline" }
              size={25}
              color={isSaved ? "#FFD166" : "#c2cade"}
            />
          </TouchableOpacity>
        </View>
        <View style={{backgroundColor: "#4947E8", height:1.5 , width:'100%', borderRadius: 5}}></View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          style={{ flex: 1, gap: 16}}
        >
          <View style={styles.jobCardFeaturedMid}>
            <View style={styles.jobCardLocation}>
              <FontAwesome6 name="location-dot" size={14} color="#c2cade" />
              <Text style={styles.jobCardFeaturedLocation}>
                {job.location}
              </Text>
            </View>
            <View style={styles.jobCardTime}>
              <Octicons name="clock-fill" size={13} color="#c2cade" />
              <Text style={styles.jobCardFeaturedTime}>
                {getTimeAgo(job.created_at)}
              </Text>
            </View>
          </View>
          <View style={styles.jobCardFeaturedBottom}>
            <Text
              style={[
                styles.jobCardFeaturedTag,
                {
                  backgroundColor:
                    job.status?.toLowerCase() === "open"
                      ? "#ccf2e0"
                      : "#ffd3d3",
                    color:
                    job.status?.toLowerCase() === "open"
                      ? "#166534"
                      : "#991B1B",
                },
              ]}
            >
              {job.status?.toUpperCase()}
            </Text>

            <Text style={styles.jobCardFeaturedTag}>
              {job.type || job.job_type}
            </Text>
            
            <Text
              style={styles.jobCardFeaturedSalary}
              numberOfLines={1}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>${job.salary}</Text>
              <Text style={{ color: "#c2cade" }}>/mo</Text>
            </Text>
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
          gap: 8,
        }}
      >
        <View
          style={[
            styles.jobCardIconBox,
            { backgroundColor: job.color || "#EEF2FF" },
          ]}
        >
          <MaterialCommunityIcons
            name={job.icon || "briefcase-outline"}
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
            {job.company_name} <Text style={{color:"#4947E8"}}>•</Text> {job.location} <Text style={{color:"#4947E8"}}>•</Text> {getTimeAgo(job.created_at)}
          </Text>

          <View style={styles.jobCardMeta}>
            <Text style={styles.jobCardTag}>
              {job.type || job.job_type}
            </Text>

          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.jobCardRight}>
        <TouchableOpacity
          onPress={handleToggle}
          hitSlop={10}
          style={{alignSelf:"flex-end", flex: 1}}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved ? "Remove saved job" : "Save job"
          }
        >
          <MaterialCommunityIcons
            name={isSaved ? "bookmark" : "bookmark-outline" }
            size={25}
            color={isSaved ? "#2623D3" : "#A1AAC0"}
          />
        </TouchableOpacity>
        <Text
          style={styles.jobCardSalary}
        >
          <Text style={{ fontSize: 11, fontWeight: "600" }}>${job.salary}</Text>
          <Text style={{ color: "#7381A2" }}>/mo</Text>
        </Text>
      </View>
    </View>
  );
}