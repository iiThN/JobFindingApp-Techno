
import {
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "./stylesIn";

export default function JobCard({
  job,
  featured = false,
  onPress,
}) {
  // kay ang cards component man kay gigamit sa role cards, maong nagbuhat ko bag o nga component
  // Lahi pud ang design kung recommended job.
  if (featured) {
    return (
      <TouchableOpacity
        style={styles.jobCardFeatured}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.jobCardFeaturedTop}>
          <View style={styles.jobCardFeaturedIcon}>
            <MaterialCommunityIcons
              name={job.icon}
              size={25}
              color="#2623D3"
            />
          </View>

          <Feather
            name="bookmark"
            size={21}
            color="#FFFFFF"
          />
        </View>

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
    );
  }

  // card para sa latest jobs.
  return (
    <TouchableOpacity
      style={styles.jobCardCard}
      onPress={onPress}
      activeOpacity={0.8}
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

      <Feather
        name="chevron-right"
        size={19}
        color="#A1AAC0"
      />
    </TouchableOpacity>
  );
}
